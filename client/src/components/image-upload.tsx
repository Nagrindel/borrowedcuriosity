import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = "Image" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onChange(data.url);
    } catch {
      alert("Upload failed. Try a smaller image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="text-xs text-gray-500 mb-1.5 block">{label}</label>
      {value ? (
        <div className="relative group">
          <img src={value} alt="" className="w-full h-40 object-cover rounded-lg" />
          <button onClick={() => onChange(null)}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-brand-500/50 transition-colors cursor-pointer"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-gray-500" />
              <span className="text-xs text-gray-500">Click to upload</span>
              <span className="text-[10px] text-gray-600">JPG, PNG, WebP (max 10MB)</span>
            </>
          )}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
    </div>
  );
}
