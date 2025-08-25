'use client';

import React, { useState, useEffect } from 'react';
import { storageManager, STORAGE_BUCKETS } from '@/lib/supabase-storage';
import FileUpload from './FileUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Image as ImageIcon, 
  Trash2, 
  Download, 
  Eye, 
  Plus,
  Grid,
  List,
  Calendar,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface PropertyImage {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    size: number;
    mimetype: string;
    cacheControl: string;
  };
}

interface PropertyGalleryProps {
  propertyId: string;
  propertyName: string;
  editable?: boolean;
  showUpload?: boolean;
  maxImages?: number;
  viewMode?: 'grid' | 'list';
}

export default function PropertyGallery({
  propertyId,
  propertyName,
  editable = false,
  showUpload = false,
  maxImages = 20,
  viewMode: initialViewMode = 'grid'
}: PropertyGalleryProps) {
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  const folderPath = `properties/${propertyId}`;

  // Load images
  useEffect(() => {
    loadImages();
  }, [propertyId]);

  // Load image URLs
  useEffect(() => {
    loadImageUrls();
  }, [images]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const files = await storageManager.listFiles(STORAGE_BUCKETS.PROPERTY_IMAGES, folderPath);
      setImages(files as PropertyImage[]);
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const loadImageUrls = async () => {
    const urls: Record<string, string> = {};
    
    for (const image of images) {
      try {
        const url = await storageManager.getFileUrl(
          STORAGE_BUCKETS.PROPERTY_IMAGES,
          `${folderPath}/${image.name}`
        );
        if (url) {
          urls[image.name] = url;
        }
      } catch (error) {
        console.error(`Error loading URL for ${image.name}:`, error);
      }
    }
    
    setImageUrls(urls);
  };

  const handleUploadComplete = (results: any[]) => {
    toast.success(`${results.length} image(s) uploaded successfully`);
    loadImages(); // Refresh the gallery
  };

  const handleUploadError = (error: string) => {
    toast.error(`Upload failed: ${error}`);
  };

  const deleteImage = async (imageName: string) => {
    try {
      const result = await storageManager.deleteFile(
        STORAGE_BUCKETS.PROPERTY_IMAGES,
        `${folderPath}/${imageName}`
      );

      if (result.success) {
        setImages(prev => prev.filter(img => img.name !== imageName));
        setImageUrls(prev => {
          const updated = { ...prev };
          delete updated[imageName];
          return updated;
        });
        toast.success('Image deleted successfully');
      } else {
        toast.error(`Failed to delete image: ${result.error}`);
      }
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const downloadImage = async (imageName: string) => {
    try {
      const url = imageUrls[imageName];
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = imageName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Property Gallery
          </h3>
          <p className="text-sm text-gray-600">
            {propertyName} • {images.length} image{images.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      {showUpload && editable && images.length < maxImages && (
        <FileUpload
          bucket={STORAGE_BUCKETS.PROPERTY_IMAGES}
          path={folderPath}
          multiple={true}
          maxFiles={maxImages - images.length}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
      )}

      {/* Gallery */}
      {images.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No images yet</h4>
            <p className="text-gray-600 mb-4">
              {showUpload && editable 
                ? 'Upload some images to get started' 
                : 'Images will appear here when available'
              }
            </p>
            {showUpload && editable && (
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Images
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div key={image.name} className="group relative">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {imageUrls[image.name] ? (
                        <img
                          src={imageUrls[image.name]}
                          alt={image.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onClick={() => setSelectedImage(imageUrls[image.name])}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedImage(imageUrls[image.name])}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => downloadImage(image.name)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {editable && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteImage(image.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Image info */}
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 truncate">{image.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(image.metadata?.size || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {images.map((image) => (
                  <div key={image.name} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {imageUrls[image.name] ? (
                        <img
                          src={imageUrls[image.name]}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {image.name}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatFileSize(image.metadata?.size || 0)}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(image.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedImage(imageUrls[image.name])}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadImage(image.name)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {editable && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteImage(image.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Property image"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4"
            onClick={() => setSelectedImage(null)}
          >
            ✕
          </Button>
        </div>
      )}
    </div>
  );
}
