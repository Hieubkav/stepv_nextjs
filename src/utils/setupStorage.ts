// Utility to setup Supabase Storage buckets
import { supabase } from '@/lib/supabaseClient';
import { extractFilePathFromUrl } from '@/hooks/useFileUpload';

export async function setupStorageBuckets() {
  try {
    console.log('🔄 Setting up Supabase Storage buckets...');

    // Create library-images bucket
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('library-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Bucket "library-images" already exists');
      } else {
        console.error('❌ Error creating bucket:', bucketError);
        return false;
      }
    } else {
      console.log('✅ Bucket "library-images" created successfully');
    }

    // List existing buckets to verify
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return false;
    }

    console.log('📋 Available buckets:', buckets?.map(b => b.name));
    
    return true;
  } catch (error) {
    console.error('❌ Unexpected error setting up storage:', error);
    return false;
  }
}

// Function to test upload functionality
export async function testUpload() {
  try {
    console.log('🧪 Testing upload functionality...');
    
    // Create a simple test file
    const testContent = 'Test file content';
    const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
    
    const { data, error } = await supabase.storage
      .from('library-images')
      .upload(`test/${Date.now()}-test.txt`, testFile);

    if (error) {
      console.error('❌ Test upload failed:', error);
      return false;
    }

    console.log('✅ Test upload successful:', data);
    
    // Clean up test file
    await supabase.storage
      .from('library-images')
      .remove([data.path]);
    
    console.log('✅ Test file cleaned up');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error during test upload:', error);
    return false;
  }
}

// Function to cleanup orphaned files (files not referenced in database)
export async function cleanupOrphanedFiles() {
  try {
    console.log('🧹 Starting cleanup of orphaned files...');

    // Get all files in storage
    const { data: files, error: listError } = await supabase.storage
      .from('library-images')
      .list('libraries', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (listError) {
      console.error('❌ Error listing files:', listError);
      return false;
    }

    if (!files || files.length === 0) {
      console.log('✅ No files found in storage');
      return true;
    }

    // Get all image URLs from database
    const { data: libraries, error: dbError } = await supabase
      .from('libraries')
      .select('image_url')
      .not('image_url', 'is', null);

    if (dbError) {
      console.error('❌ Error fetching library URLs:', dbError);
      return false;
    }

    // Extract file paths from database URLs
    const referencedPaths = new Set<string>();
    libraries?.forEach(lib => {
      if (lib.image_url) {
        const path = extractFilePathFromUrl(lib.image_url, 'library-images');
        if (path) {
          referencedPaths.add(path);
        }
      }
    });

    // Find orphaned files
    const orphanedFiles: string[] = [];
    files.forEach(file => {
      const filePath = `libraries/${file.name}`;
      if (!referencedPaths.has(filePath)) {
        orphanedFiles.push(filePath);
      }
    });

    if (orphanedFiles.length === 0) {
      console.log('✅ No orphaned files found');
      return true;
    }

    console.log(`🗑️ Found ${orphanedFiles.length} orphaned files:`, orphanedFiles);

    // Delete orphaned files
    const { error: deleteError } = await supabase.storage
      .from('library-images')
      .remove(orphanedFiles);

    if (deleteError) {
      console.error('❌ Error deleting orphaned files:', deleteError);
      return false;
    }

    console.log(`✅ Successfully cleaned up ${orphanedFiles.length} orphaned files`);
    return true;
  } catch (error) {
    console.error('❌ Unexpected error during cleanup:', error);
    return false;
  }
}
