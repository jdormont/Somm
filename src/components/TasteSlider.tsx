import { useRef, useEffect, useState } from 'react';

interface TasteSliderProps {
  label: string;
  leftLabel: string;
  rightLabel: string;
  min?: number;
  max?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export default function TasteSlider({
  label,
  leftLabel,
  rightLabel,
  min = 1,
  max = 10,
  value,
  onChange,
}: TasteSliderProps) {
  const [minVal, maxVal] = value;
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

  const handleInteract = (clientX: number, thumb: 'min' | 'max') => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    const rawVal = Math.round(percent * (max - min) + min);

    if (thumb === 'min') {
      const newVal = Math.min(rawVal, maxVal - 1); // Prevent crossover (keep at least 1 unit gap)
      onChange([Math.max(newVal, min), maxVal]);
    } else {
      const newVal = Math.max(rawVal, minVal + 1);
      onChange([minVal, Math.min(newVal, max)]);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      handleInteract(clientX, isDragging);
    };

    const onUp = () => {
      setIsDragging(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging, minVal, maxVal]); // Re-bind when values change to ensure fresh closure if needed, though handleInteract uses props directly if passed, but here we depend on onChange which is stable. Wait, minVal/maxVal in handleInteract might be stale if closure captures them?
  
  // NOTE: In the effect, handleInteract refers to the function scope. 
  // Ideally handleInteract should just calculate raw value and we pass current min/max references or use functional updates if possible.
  // But here we call onChange. 
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-champagne-100">{label}</label>
        <span className="text-xs font-mono text-champagne-400">
          {minVal} - {maxVal}
        </span>
      </div>

      <div className="relative h-12 flex items-center touch-none select-none" ref={trackRef}>
        {/* Track Line */}
        <div className="absolute w-full h-1 bg-white/10 rounded-full overflow-hidden">
          {/* Active Range */}
          <div
            className="absolute h-full bg-somm-red-500 rounded-full opacity-80"
            style={{
              left: `${getPercentage(minVal)}%`,
              width: `${getPercentage(maxVal) - getPercentage(minVal)}%`,
            }}
          />
        </div>

        {/* Min Thumb */}
        <div
          className={`absolute w-5 h-5 bg-champagne-100 border-2 border-somm-red-500 rounded-full shadow-lg cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10 ${isDragging === 'min' ? 'scale-110 z-20' : ''}`}
          style={{ left: `calc(${getPercentage(minVal)}% - 10px)` }}
          onMouseDown={(e) => { e.preventDefault(); setIsDragging('min'); }}
          onTouchStart={(e) => { setIsDragging('min'); }}
        />

        {/* Max Thumb */}
        <div
          className={`absolute w-5 h-5 bg-champagne-100 border-2 border-somm-red-500 rounded-full shadow-lg cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10 ${isDragging === 'max' ? 'scale-110 z-20' : ''}`}
          style={{ left: `calc(${getPercentage(maxVal)}% - 10px)` }}
          onMouseDown={(e) => { e.preventDefault(); setIsDragging('max'); }}
          onTouchStart={(e) => { setIsDragging('max'); }}
        />
        
        {/* Ticks (Visual Guide) */}
        <div className="absolute w-full flex justify-between px-[10px] pointer-events-none opacity-20 text-[8px] top-7">
           {Array.from({ length: max - min + 1 }).map((_, i) => (
             <div key={i} className="flex flex-col items-center gap-1">
               <div className="w-px h-1 bg-white" />
             </div>
           ))}
        </div>
      </div>

      <div className="flex justify-between text-xs text-stone-500 -mt-2">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
