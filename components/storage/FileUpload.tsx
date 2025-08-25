'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { storageManager, StorageBucket, STORAGE_BUCKETS, FILE_CONFIGS } from '@/lib/supabase-storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
// import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  Image, 
  X, 
  Check, 
  AlertCircle,
  FileText,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  bucket: StorageBucket;
  path: string;
  multiple?: boolean;
  maxFiles?: number;
  onUploadComplete?: (results: any[]) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  result?: any;
  error?: string;
}

export default function FileUpload({
  bucket,
  path,
  multiple = false,
  maxFiles = 10,
  onUploadComplete,
  onUploadError,
  className = '',
  disabled = false
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const config = FILE_CONFIGS[bucket];

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled || isUploading) return;

    // Validate file count
    if (!multiple && acceptedFiles.length > 1) {
      toast.error('Only one file allowed');
      return;
    }

    if (acceptedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsUploading(true);
    
    // Initialize uploading files state
    const initialFiles: UploadingFile[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));
    
    setUploadingFiles(initialFiles);

    try {
      const uploadPromises = acceptedFiles.map(async (file, index) => {
        try {
          // Simulate progress updates
          const progressInterval = setInterval(() => {
            setUploadingFiles(prev => 
              prev.map((f, i) => 
                i === index && f.status === 'uploading' 
                  ? { ...f, progress: Math.min(f.progress + 10, 90) }
                  : f
              )
            );
          }, 200);

          const result = await storageManager.uploadFile({
            bucket,
            path,
            file,
            metadata: {
              originalName: file.name,
              uploadedAt: new Date().toISOString(),
              size: file.size
            }
          });

          clearInterval(progressInterval);

          if (result.success) {
            setUploadingFiles(prev => 
              prev.map((f, i) => 
                i === index 
                  ? { ...f, progress: 100, status: 'completed', result: result.data }
                  : f
              )
            );
            return result;
          } else {
            setUploadingFiles(prev => 
              prev.map((f, i) => 
                i === index 
                  ? { ...f, status: 'error', error: result.error }
                  : f
              )
            );
            throw new Error(result.error);
          }
        } catch (error) {
          setUploadingFiles(prev => 
            prev.map((f, i) => 
              i === index 
                ? { ...f, status: 'error', error: error.message }
                : f
            )
          );
          throw error;
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      
      const successful = results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value);
      
      const failed = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason);

      if (successful.length > 0) {
        toast.success(`${successful.length} file(s) uploaded successfully`);
        onUploadComplete?.(successful);
      }

      if (failed.length > 0) {
        toast.error(`${failed.length} file(s) failed to upload`);
        onUploadError?.(failed[0]?.message || 'Upload failed');
      }

    } catch (error) {
      toast.error('Upload failed');
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [bucket, path, multiple, maxFiles, disabled, isUploading, onUploadComplete, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: config.allowedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: config.maxSize,
    multiple,
    disabled: disabled || isUploading
  });

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-5 w-5" />;
    } else {
      return <File className="h-5 w-5" />;
    }
  };

  const getBucketIcon = (bucket: StorageBucket) => {
    switch (bucket) {
      case STORAGE_BUCKETS.PROPERTY_IMAGES:
      case STORAGE_BUCKETS.CONSTRUCTION_PHOTOS:
        return <Image className="h-5 w-5" />;
      case STORAGE_BUCKETS.CONTRACTS:
      case STORAGE_BUCKETS.PROPERTY_DOCUMENTS:
      case STORAGE_BUCKETS.CLIENT_DOCUMENTS:
        return <FileText className="h-5 w-5" />;
      default:
        return <Upload className="h-5 w-5" />;
    }
  };

  const getBucketLabel = (bucket: StorageBucket) => {
    switch (bucket) {
      case STORAGE_BUCKETS.PROPERTY_IMAGES:
        return 'Property Images';
      case STORAGE_BUCKETS.CONSTRUCTION_PHOTOS:
        return 'Construction Photos';
      case STORAGE_BUCKETS.CONTRACTS:
        return 'Contracts';
      case STORAGE_BUCKETS.PROPERTY_DOCUMENTS:
        return 'Property Documents';
      case STORAGE_BUCKETS.CLIENT_DOCUMENTS:
        return 'Client Documents';
      case STORAGE_BUCKETS.AVATARS:
        return 'Avatars';
      default:
        return 'Files';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
              ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center space-y-4">
              {getBucketIcon(bucket)}
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop files here' : `Upload ${getBucketLabel(bucket)}`}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {isDragActive 
                    ? 'Release to upload'
                    : `Drag & drop ${multiple ? 'files' : 'a file'} here, or click to select`
                  }
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {config.allowedTypes.map(type => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {type.split('/')[1].toUpperCase()}
                  </Badge>
                ))}
              </div>

              <p className="text-xs text-gray-500">
                Max size: {Math.round(config.maxSize / (1024 * 1024))}MB
                {multiple && ` • Max files: ${maxFiles}`}
              </p>

              {!isDragActive && (
                <Button variant="outline" disabled={disabled || isUploading}>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-4">
              {isUploading ? 'Uploading Files...' : 'Upload Results'}
            </h4>
            
            <div className="space-y-3">
              {uploadingFiles.map((uploadingFile, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getFileIcon(uploadingFile.file)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadingFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(uploadingFile.file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    
                    {uploadingFile.status === 'uploading' && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadingFile.progress}%` }}
                        ></div>
                      </div>
                    )}
                    
                    {uploadingFile.status === 'error' && (
                      <p className="text-xs text-red-600 mt-1">
                        {uploadingFile.error}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0">
                    {uploadingFile.status === 'uploading' && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    )}
                    {uploadingFile.status === 'completed' && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                    {uploadingFile.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    
                    {!isUploading && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
