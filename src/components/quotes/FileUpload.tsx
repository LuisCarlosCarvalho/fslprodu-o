import React, { useState, useRef } from 'react';
import { Upload, X, File, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type FileUploadProps = {
  files: string[];
  onFilesChange: (urls: string[]) => void;
  maxSizeMB?: number;
  onUploadStatusChange?: (isUploading: boolean) => void;
};

export function FileUpload({ files, onFilesChange, maxSizeMB = 5, onUploadStatusChange }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    onUploadStatusChange?.(true); // Notify parent
    const newUrls: string[] = [...files];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          
          // Validation
          if (file.size > maxSizeMB * 1024 * 1024) {
              alert(`Arquivo ${file.name} excede o limite de ${maxSizeMB}MB.`);
              continue;
          }

          try {
              const fileExt = file.name.split('.').pop();
              const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
              const filePath = `quote-attachments/${fileName}`;

              const { error: uploadError } = await supabase.storage
                  .from('quotes')
                  .upload(filePath, file);

              if (uploadError) throw uploadError;

              const { data: { publicUrl } } = supabase.storage
                  .from('quotes')
                  .getPublicUrl(filePath);

              newUrls.push(publicUrl);
          } catch (error) {
              console.error('Erro no upload:', error);
              // Don't alert here to avoid spamming alerts, just log
          }
      }

      onFilesChange(newUrls);
    } catch (err) {
      console.error('Critical upload error:', err);
    } finally {
      setUploading(false);
      onUploadStatusChange?.(false); // Notify parent
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFile = (indexToRemove: number) => {
    onFilesChange(files.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-bold text-gray-700">Anexos (Opcional - Max {maxSizeMB}MB)</label>
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />
        
        {uploading ? (
          <Loader2 className="text-blue-600 animate-spin" size={32} />
        ) : (
          <Upload className="text-gray-400 group-hover:text-blue-500 transition-colors" size={32} />
        )}
        
        <div className="text-center">
          <p className="text-gray-900 font-bold">{uploading ? 'Enviando arquivos...' : 'Clique para enviar arquivos'}</p>
          <p className="text-gray-500 text-xs mt-1">Imagens, PDFs ou Documentos</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {files.map((url, index) => {
            const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm group">
                <div className="flex items-center gap-3 truncate">
                  {isImage ? (
                    <ImageIcon className="text-blue-500 flex-shrink-0" size={18} />
                  ) : (
                    <File className="text-gray-400 flex-shrink-0" size={18} />
                  )}
                  <span className="text-xs text-gray-600 truncate">{url.split('/').pop()}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
