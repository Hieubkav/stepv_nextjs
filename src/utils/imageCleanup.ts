import { supabase } from '@/lib/supabaseClient';

interface ImageReference {
  table: string;
  column: string;
  id: string;
  imageUrl: string;
}

/**
 * Image Cleanup Service - Tương đương Observer pattern trong Laravel
 * Tự động xóa ảnh trong storage khi không còn được tham chiếu trong database
 */
export class ImageCleanupService {
  private static instance: ImageCleanupService;
  private bucket: string = 'library-images';

  private constructor() {}

  static getInstance(): ImageCleanupService {
    if (!ImageCleanupService.instance) {
      ImageCleanupService.instance = new ImageCleanupService();
    }
    return ImageCleanupService.instance;
  }

  /**
   * Extract file path from Supabase storage URL
   */
  private extractFilePath(url: string): string | null {
    try {
      if (!url) return null;
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const bucketIndex = pathParts.indexOf(this.bucket);
      if (bucketIndex === -1) return null;
      return pathParts.slice(bucketIndex + 1).join('/');
    } catch {
      return null;
    }
  }

  /**
   * Delete file from storage
   */
  private async deleteFromStorage(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.bucket)
        .remove([filePath]);

      if (error) {
        console.error('❌ Storage delete error:', error);
        return false;
      }

      console.log('✅ Deleted from storage:', filePath);
      return true;
    } catch (error) {
      console.error('❌ Unexpected storage delete error:', error);
      return false;
    }
  }

  /**
   * Get all image URLs from a specific table and column
   */
  private async getImageReferences(table: string, column: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select(column)
        .not(column, 'is', null);

      if (error) {
        console.error(`❌ Error fetching ${table}.${column}:`, error);
        return [];
      }

      return data
        .map((row: any) => row[column])
        .filter(url => url && typeof url === 'string');
    } catch (error) {
      console.error(`❌ Unexpected error fetching ${table}.${column}:`, error);
      return [];
    }
  }

  /**
   * Get all files in storage bucket
   */
  private async getStorageFiles(): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucket)
        .list('', { limit: 1000 });

      if (error) {
        console.error('❌ Error listing storage files:', error);
        return [];
      }

      const allFiles: string[] = [];

      // Get files from root
      const rootFiles = data
        .filter(item => item.name && !item.name.includes('/'))
        .map(item => item.name);
      allFiles.push(...rootFiles);

      // Get files from subfolders
      const folders = data.filter(item => item.name && !item.name.includes('.'));
      for (const folder of folders) {
        const { data: folderData, error: folderError } = await supabase.storage
          .from(this.bucket)
          .list(folder.name, { limit: 1000 });

        if (!folderError && folderData) {
          const folderFiles = folderData
            .filter(item => item.name && item.name.includes('.'))
            .map(item => `${folder.name}/${item.name}`);
          allFiles.push(...folderFiles);
        }
      }

      return allFiles;
    } catch (error) {
      console.error('❌ Unexpected error listing storage files:', error);
      return [];
    }
  }

  /**
   * Cleanup orphaned images when a record is deleted
   * Call this method in your CRUD operations after successful deletion
   */
  async cleanupAfterDelete(deletedImageUrls: string[]): Promise<void> {
    if (!deletedImageUrls || deletedImageUrls.length === 0) return;

    console.log('🧹 Starting cleanup after delete:', deletedImageUrls);

    for (const imageUrl of deletedImageUrls) {
      const filePath = this.extractFilePath(imageUrl);
      if (!filePath) continue;

      // Check if this image is still referenced anywhere else
      const isStillReferenced = await this.isImageReferenced(imageUrl);
      
      if (!isStillReferenced) {
        await this.deleteFromStorage(filePath);
        console.log('🗑️ Cleaned up orphaned image:', filePath);
      } else {
        console.log('⚠️ Image still referenced, skipping:', filePath);
      }
    }
  }

  /**
   * Check if an image URL is still referenced in any table
   */
  private async isImageReferenced(imageUrl: string): Promise<boolean> {
    const tables = [
      { table: 'libraries', column: 'image_url' },
      { table: 'library_images', column: 'image_url' },
      // Add more tables/columns as needed
    ];

    for (const { table, column } of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .eq(column, imageUrl)
          .limit(1);

        if (error) {
          console.error(`❌ Error checking ${table}.${column}:`, error);
          continue;
        }

        if (data && data.length > 0) {
          return true;
        }
      } catch (error) {
        console.error(`❌ Unexpected error checking ${table}.${column}:`, error);
      }
    }

    return false;
  }

  /**
   * Run comprehensive cleanup to remove all orphaned images
   * This can be run periodically as a maintenance task
   */
  async runFullCleanup(): Promise<{ deleted: number; errors: number }> {
    console.log('🧹 Starting full cleanup...');

    let deleted = 0;
    let errors = 0;

    try {
      // Get all files in storage
      const storageFiles = await this.getStorageFiles();
      console.log(`📁 Found ${storageFiles.length} files in storage`);

      // Get all referenced images from database
      const referencedImages = new Set<string>();

      const tables = [
        { table: 'libraries', column: 'image_url' },
        { table: 'library_images', column: 'image_url' },
      ];

      for (const { table, column } of tables) {
        const urls = await this.getImageReferences(table, column);
        urls.forEach(url => {
          const filePath = this.extractFilePath(url);
          if (filePath) referencedImages.add(filePath);
        });
      }

      console.log(`📎 Found ${referencedImages.size} referenced images`);

      // Find orphaned files
      const orphanedFiles = storageFiles.filter(filePath => !referencedImages.has(filePath));
      console.log(`🗑️ Found ${orphanedFiles.length} orphaned files`);

      // Delete orphaned files
      for (const filePath of orphanedFiles) {
        const success = await this.deleteFromStorage(filePath);
        if (success) {
          deleted++;
        } else {
          errors++;
        }
      }

      console.log(`✅ Cleanup completed: ${deleted} deleted, ${errors} errors`);

    } catch (error) {
      console.error('❌ Full cleanup error:', error);
      errors++;
    }

    return { deleted, errors };
  }

  /**
   * Clean up old images when updating a record with new image
   */
  async cleanupAfterUpdate(oldImageUrl: string | null, newImageUrl: string | null): Promise<void> {
    if (!oldImageUrl || oldImageUrl === newImageUrl) return;

    console.log('🧹 Cleaning up after update:', oldImageUrl);

    const filePath = this.extractFilePath(oldImageUrl);
    if (!filePath) return;

    // Check if old image is still referenced elsewhere
    const isStillReferenced = await this.isImageReferenced(oldImageUrl);
    
    if (!isStillReferenced) {
      await this.deleteFromStorage(filePath);
      console.log('🗑️ Cleaned up old image after update:', filePath);
    } else {
      console.log('⚠️ Old image still referenced elsewhere, skipping:', filePath);
    }
  }
}

// Export singleton instance
export const imageCleanup = ImageCleanupService.getInstance();