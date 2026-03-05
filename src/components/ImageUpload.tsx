import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  folder: "avatars" | "vendors" | "products";
  shape?: "circle" | "rounded";
  size?: "sm" | "md" | "lg";
  placeholder?: string;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-full h-40",
};

const ImageUpload = ({
  currentUrl,
  onUpload,
  folder,
  shape = "rounded",
  size = "md",
  placeholder = "Upload image",
}: ImageUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${folder}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage.from("uploads").upload(path, file, {
        upsert: true,
      });
      if (error) throw error;

      const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      setPreview(publicUrl);
      onUpload(publicUrl);
      toast.success("Image uploaded!");
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    onUpload("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const isLarge = size === "lg";
  const isCircle = shape === "circle";

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className={`relative ${sizeClasses[size]} ${isCircle ? "rounded-full" : "rounded-xl"} overflow-hidden group`}>
          <img
            src={preview}
            alt="Upload preview"
            className="w-full h-full object-cover"
          />
          <div
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          >
            <Camera className="w-5 h-5 text-background" />
          </div>
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`${sizeClasses[size]} ${isCircle ? "rounded-full" : "rounded-xl"} border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-muted transition-colors cursor-pointer disabled:opacity-50`}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          ) : (
            <>
              <Upload className="w-5 h-5 text-muted-foreground" />
              {!isCircle && <span className="text-[10px] text-muted-foreground">{placeholder}</span>}
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ImageUpload;
