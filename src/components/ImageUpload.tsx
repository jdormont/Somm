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
      <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-50">
        <img
          src={imagePreview}
          alt="Wine list preview"
          className="w-full max-h-80 object-contain"
        />
        <button
          onClick={onClear}
          className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
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
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 ${
          isDragging
            ? 'border-wine-800 bg-wine-50/50'
            : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
        } ${processing ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="flex flex-col items-center gap-4 py-12 px-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
            isDragging ? 'bg-wine-100' : 'bg-stone-100'
          }`}>
            <ImageIcon className={`w-7 h-7 ${isDragging ? 'text-wine-700' : 'text-stone-400'}`} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-stone-700">
              {processing ? 'Processing image...' : 'Drop an image here, or click to browse'}
            </p>
            <p className="text-xs text-stone-400 mt-1">
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

      <div className="mt-3 flex justify-center">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="inline-flex items-center gap-2 text-sm font-medium text-wine-800 hover:text-wine-900 transition-colors px-4 py-2 rounded-xl hover:bg-wine-50"
        >
          <Camera className="w-4 h-4" />
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
