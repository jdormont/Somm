import { useCallback, useState, useRef } from 'react';
import { Camera, X, Image as ImageIcon } from 'lucide-react';
import { compressImage } from '../lib/imageUtils';

interface ImageUploadProps {
  onImageReady: (base64: string) => void;
  imagePreview: string | null;
  onClear: () => void;
}

export default function ImageUpload({ onImageReady, imagePreview, onClear }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setProcessing(true);
    try {
      const base64 = await compressImage(file);
      onImageReady(base64);
    } catch {
      // silently fail
    }
    setProcessing(false);
  }, [onImageReady]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  if (imagePreview) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/20 group">
        <img
          src={imagePreview}
          alt="Wine list preview"
          className="w-full max-h-80 object-contain"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
        <button
          onClick={onClear}
          className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-somm-red-900/80 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm border border-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 ${
          isDragging
            ? 'border-champagne-400 bg-champagne-400/10'
            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
        } ${processing ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="flex flex-col items-center gap-4 py-12 px-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
            isDragging ? 'bg-champagne-400/20' : 'bg-white/5'
          }`}>
            <ImageIcon className={`w-7 h-7 transition-colors ${isDragging ? 'text-champagne-400' : 'text-stone-500'}`} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-champagne-100">
              {processing ? 'Processing image...' : 'Drop an image here, or click to browse'}
            </p>
            <p className="text-xs text-stone-500 mt-1">
              JPG, PNG up to 20MB
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="inline-flex items-center gap-2 text-sm font-medium text-champagne-400 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/5 group"
        >
          <Camera className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Use camera instead
        </button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
