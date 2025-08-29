import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import sharp from 'sharp';
import slugify from 'slugify';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string || 'library-images';
    const folder = formData.get('folder') as string || 'uploads';
    const quality = parseInt(formData.get('quality') as string) || 80;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate filename using slugify
    const originalName = file.name.split('.')[0];
    const slugifiedName = slugify(originalName, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `${slugifiedName}-${timestamp}-${randomString}.webp`;
    const filePath = `${folder}/${fileName}`;

    // Process image with sharp - convert to WebP for better compression
    let processedBuffer;
    try {
      processedBuffer = await sharp(buffer)
        .webp({ 
          quality,
          effort: 6, // Higher effort for better compression
          lossless: false 
        })
        .resize(1920, 1920, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .toBuffer();

      console.log('✅ Image processed with Sharp:', {
        originalSize: buffer.length,
        processedSize: processedBuffer.length,
        compression: ((buffer.length - processedBuffer.length) / buffer.length * 100).toFixed(1) + '%'
      });
    } catch (error) {
      console.error('❌ Sharp processing error:', error);
      return NextResponse.json(
        { error: 'Image processing failed' },
        { status: 500 }
      );
    }

    // Upload processed image to Supabase Storage
    let { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, processedBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000', // 1 year cache
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Supabase upload error:', uploadError);
      
      // Try to create bucket if it doesn't exist
      if (uploadError.message.includes('Bucket not found')) {
        console.log('🔄 Creating bucket:', bucket);
        const { error: createBucketError } = await supabase.storage.createBucket(bucket, {
          public: true,
          allowedMimeTypes: ['image/webp', 'image/jpeg', 'image/png', 'image/gif'],
          fileSizeLimit: 10485760 // 10MB
        });

        if (createBucketError && !createBucketError.message.includes('already exists')) {
          console.error('❌ Create bucket error:', createBucketError);
          return NextResponse.json(
            { error: 'Failed to create storage bucket' },
            { status: 500 }
          );
        }

        // Retry upload after creating bucket
        const retryResult = await supabase.storage
          .from(bucket)
          .upload(filePath, processedBuffer, {
            contentType: 'image/webp',
            cacheControl: '31536000',
            upsert: false
          });

        if (retryResult.error) {
          console.error('❌ Retry upload error:', retryResult.error);
          return NextResponse.json(
            { error: 'Upload failed after bucket creation' },
            { status: 500 }
          );
        }

        data = retryResult.data;
      } else {
        return NextResponse.json(
          { error: uploadError.message },
          { status: 500 }
        );
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    const result = {
      url: urlData.publicUrl,
      path: filePath,
      fileName,
      originalName: file.name,
      processedSize: processedBuffer.length,
      originalSize: buffer.length,
      bucket,
      folder
    };

    console.log('✅ Upload successful:', result);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle file deletion
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get('bucket') || 'library-images';
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (deleteError) {
      console.error('❌ Delete error:', deleteError);
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    console.log('✅ File deleted successfully:', filePath);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}