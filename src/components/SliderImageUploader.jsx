import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, X, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SliderImageUploader = ({ currentImageUrl, onImageUploaded, onImageRemoved }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentImageUrl) {
      if (currentImageUrl.startsWith('http')) {
        setPreviewUrl(currentImageUrl);
      } else {
        getImageUrl(currentImageUrl);
      }
    } else {
      setPreviewUrl('');
    }
  }, [currentImageUrl]);

  const getImageUrl = async (path) => {
    if (!path) return;

    const { data } = supabase.storage
      .from('slider-images')
      .getPublicUrl(path);

    if (data?.publicUrl) {
      setPreviewUrl(data.publicUrl);
    }
  };

  const uploadImage = async (file) => {
    try {
      setUploading(true);
      setError('');

      if (!file) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `slider-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError, data } = await supabase.storage
        .from('slider-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('slider-images')
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      setPreviewUrl(publicUrlData.publicUrl);
      onImageUploaded(filePath);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('فشل رفع الصورة. حاول مرة أخرى.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('نوع الملف غير مدعوم. استخدم JPG, PNG, WebP أو GIF');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    uploadImage(file);
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    setError('');
    onImageRemoved();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">صورة السلايد</label>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {previewUrl ? (
        <div className="space-y-3">
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center">
                <Loader className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex-1 bg-[#276073] hover:bg-[#1e4a5a] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer text-center">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              تغيير الصورة
            </label>
            <button
              onClick={handleRemoveImage}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              disabled={uploading}
            >
              <X className="w-4 h-4" />
              حذف
            </button>
          </div>
        </div>
      ) : (
        <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#276073] transition-colors duration-200 bg-gray-50 hover:bg-gray-100">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <div className="flex flex-col items-center space-y-3">
            {uploading ? (
              <>
                <Loader className="w-12 h-12 text-[#276073] animate-spin" />
                <p className="text-sm text-gray-600">جاري رفع الصورة...</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-[#276073]/10 rounded-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-[#276073]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    اضغط لرفع صورة أو اسحب الصورة هنا
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG, WebP أو GIF (حد أقصى 5 ميجابايت)
                  </p>
                </div>
              </>
            )}
          </div>
        </label>
      )}

      <p className="text-xs text-gray-500">
        الأبعاد المثالية: 1920×1080 بكسل للحصول على أفضل جودة
      </p>
    </div>
  );
};

export default SliderImageUploader;
