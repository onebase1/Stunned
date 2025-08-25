/**
 * Supabase Storage Management for Heritage100 CRM
 * Property images, documents, contracts, and construction progress photos
 * with proper access policies and CDN optimization
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for bucket management
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Storage bucket configuration
export const STORAGE_BUCKETS = {
  PROPERTY_IMAGES: 'property-images',
  PROPERTY_DOCUMENTS: 'property-documents',
  CONTRACTS: 'contracts',
  CONSTRUCTION_PHOTOS: 'construction-photos',
  CLIENT_DOCUMENTS: 'client-documents',
  AVATARS: 'avatars'
} as const;

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

// File type configurations
export const FILE_CONFIGS = {
  [STORAGE_BUCKETS.PROPERTY_IMAGES]: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    quality: 85,
    maxWidth: 2048,
    maxHeight: 2048
  },
  [STORAGE_BUCKETS.PROPERTY_DOCUMENTS]: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  [STORAGE_BUCKETS.CONTRACTS]: {
    maxSize: 25 * 1024 * 1024, // 25MB
    allowedTypes: ['application/pdf'],
  },
  [STORAGE_BUCKETS.CONSTRUCTION_PHOTOS]: {
    maxSize: 15 * 1024 * 1024, // 15MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    quality: 90,
    maxWidth: 4096,
    maxHeight: 4096
  },
  [STORAGE_BUCKETS.CLIENT_DOCUMENTS]: {
    maxSize: 25 * 1024 * 1024, // 25MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  [STORAGE_BUCKETS.AVATARS]: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    quality: 80,
    maxWidth: 512,
    maxHeight: 512
  }
};

export interface UploadOptions {
  bucket: StorageBucket;
  path: string;
  file: File;
  metadata?: Record<string, any>;
  transform?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  };
}

export interface UploadResult {
  success: boolean;
  data?: {
    path: string;
    fullPath: string;
    publicUrl: string;
    signedUrl?: string;
  };
  error?: string;
}

/**
 * Storage Manager Class
 */
export class StorageManager {
  private static instance: StorageManager;

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  /**
   * Initialize storage buckets with proper policies
   */
  async initializeBuckets() {
    const buckets = Object.values(STORAGE_BUCKETS);
    
    for (const bucketName of buckets) {
      try {
        // Create bucket if it doesn't exist
        const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
          public: bucketName === STORAGE_BUCKETS.PROPERTY_IMAGES || bucketName === STORAGE_BUCKETS.AVATARS,
          allowedMimeTypes: FILE_CONFIGS[bucketName].allowedTypes,
          fileSizeLimit: FILE_CONFIGS[bucketName].maxSize
        });

        if (createError && !createError.message.includes('already exists')) {
          console.error(`Error creating bucket ${bucketName}:`, createError);
          continue;
        }

        // Set up RLS policies
        await this.setupBucketPolicies(bucketName);
        
        console.log(`✅ Bucket ${bucketName} initialized successfully`);
      } catch (error) {
        console.error(`❌ Error initializing bucket ${bucketName}:`, error);
      }
    }
  }

  /**
   * Set up Row Level Security policies for buckets
   */
  private async setupBucketPolicies(bucketName: string) {
    const policies = this.getBucketPolicies(bucketName);
    
    for (const policy of policies) {
      try {
        await supabaseAdmin.rpc('create_storage_policy', policy);
      } catch (error) {
        // Policy might already exist, which is fine
        if (!error.message?.includes('already exists')) {
          console.warn(`Warning setting up policy for ${bucketName}:`, error);
        }
      }
    }
  }

  /**
   * Get RLS policies for each bucket
   */
  private getBucketPolicies(bucketName: string) {
    const commonPolicies = [
      {
        policy_name: `${bucketName}_select_policy`,
        bucket_name: bucketName,
        operation: 'SELECT',
        definition: 'auth.role() = \'authenticated\''
      },
      {
        policy_name: `${bucketName}_insert_policy`,
        bucket_name: bucketName,
        operation: 'INSERT',
        definition: 'auth.role() = \'authenticated\''
      },
      {
        policy_name: `${bucketName}_update_policy`,
        bucket_name: bucketName,
        operation: 'UPDATE',
        definition: 'auth.role() = \'authenticated\''
      }
    ];

    // Add delete policy for non-contract buckets
    if (bucketName !== STORAGE_BUCKETS.CONTRACTS) {
      commonPolicies.push({
        policy_name: `${bucketName}_delete_policy`,
        bucket_name: bucketName,
        operation: 'DELETE',
        definition: 'auth.role() = \'authenticated\''
      });
    }

    return commonPolicies;
  }

  /**
   * Upload file with validation and optimization
   */
  async uploadFile(options: UploadOptions): Promise<UploadResult> {
    const { bucket, path, file, metadata, transform } = options;

    try {
      // Validate file
      const validation = this.validateFile(file, bucket);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Process file if needed (resize, compress, etc.)
      const processedFile = await this.processFile(file, bucket, transform);

      // Generate unique path if needed
      const finalPath = this.generateFilePath(path, file.name);

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(finalPath, processedFile, {
          metadata,
          upsert: false
        });

      if (error) {
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      // Get signed URL for private buckets
      let signedUrl;
      if (!this.isPublicBucket(bucket)) {
        const { data: signedData } = await supabase.storage
          .from(bucket)
          .createSignedUrl(data.path, 3600); // 1 hour expiry
        signedUrl = signedData?.signedUrl;
      }

      return {
        success: true,
        data: {
          path: data.path,
          fullPath: data.fullPath,
          publicUrl: urlData.publicUrl,
          signedUrl
        }
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files: UploadOptions[]): Promise<UploadResult[]> {
    const results = await Promise.all(
      files.map(options => this.uploadFile(options))
    );
    return results;
  }

  /**
   * Delete file
   */
  async deleteFile(bucket: StorageBucket, path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Delete failed' 
      };
    }
  }

  /**
   * Get file URL (public or signed)
   */
  async getFileUrl(bucket: StorageBucket, path: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      if (this.isPublicBucket(bucket)) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
      } else {
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, expiresIn);
        
        if (error) {
          console.error('Error creating signed URL:', error);
          return null;
        }
        
        return data.signedUrl;
      }
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  }

  /**
   * List files in bucket
   */
  async listFiles(bucket: StorageBucket, folder?: string, limit: number = 100) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder, {
          limit,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File, bucket: StorageBucket): { valid: boolean; error?: string } {
    const config = FILE_CONFIGS[bucket];

    // Check file size
    if (file.size > config.maxSize) {
      return {
        valid: false,
        error: `File size exceeds limit of ${config.maxSize / (1024 * 1024)}MB`
      };
    }

    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} not allowed. Allowed types: ${config.allowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Process file (resize, compress, etc.)
   */
  private async processFile(file: File, bucket: StorageBucket, transform?: UploadOptions['transform']): Promise<File> {
    const config = FILE_CONFIGS[bucket];
    
    // Only process images
    if (!file.type.startsWith('image/')) {
      return file;
    }

    // If no processing needed, return original
    if (!config.quality && !config.maxWidth && !config.maxHeight && !transform) {
      return file;
    }

    try {
      // Create canvas for image processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      return new Promise((resolve) => {
        img.onload = () => {
          // Calculate dimensions
          const maxWidth = transform?.width || config.maxWidth || img.width;
          const maxHeight = transform?.height || config.maxHeight || img.height;
          
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          // Set canvas size
          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);
          
          const quality = (transform?.quality || config.quality || 85) / 100;
          const format = transform?.format || 'jpeg';
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const processedFile = new File([blob], file.name, {
                  type: `image/${format}`,
                  lastModified: Date.now()
                });
                resolve(processedFile);
              } else {
                resolve(file);
              }
            },
            `image/${format}`,
            quality
          );
        };

        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.warn('Error processing image, using original:', error);
      return file;
    }
  }

  /**
   * Generate unique file path
   */
  private generateFilePath(basePath: string, fileName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = fileName.split('.').pop();
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    
    return `${basePath}/${nameWithoutExt}_${timestamp}_${randomString}.${extension}`;
  }

  /**
   * Check if bucket is public
   */
  private isPublicBucket(bucket: StorageBucket): boolean {
    return bucket === STORAGE_BUCKETS.PROPERTY_IMAGES || bucket === STORAGE_BUCKETS.AVATARS;
  }
}

// Export singleton instance
export const storageManager = StorageManager.getInstance();
