import React, { useState, useRef } from 'react';
import { Upload, X, Download, FileText, Image } from 'lucide-react';
import { UploadedFile, uploadFile, deleteFile, downloadFile, formatFileSize, isValidFileType } from '../utils/fileUpload';

interface FileUploadAreaProps {
  onFileUploaded: (file: UploadedFile) => void;
  allowedTypes?: string[];
  maxSize?: number; // MB
  multiple?: boolean;
  className?: string;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  onFileUploaded,
  allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'],
  maxSize = 10, // 10MB
  multiple = false,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    setError('');
    
    if (!multiple && files.length > 1) {
      setError('複数ファイルの選択はできません');
      return;
    }

    for (const file of files) {
      // ファイルサイズチェック
      if (file.size > maxSize * 1024 * 1024) {
        setError(`ファイルサイズが大きすぎます。最大${maxSize}MBまでです。`);
        continue;
      }

      // ファイルタイプチェック
      if (!isValidFileType(file, allowedTypes)) {
        setError(`対応していないファイル形式です。対応形式: ${allowedTypes.join(', ')}`);
        continue;
      }

      try {
        setIsUploading(true);
        const uploadedFile = await uploadFile(file, undefined, undefined, undefined);
        onFileUploaded(uploadedFile);
      } catch (err) {
        setError('ファイルのアップロードに失敗しました');
      } finally {
        setIsUploading(false);
      }
    }

    // ファイル入力のリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragOver
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={allowedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />
        
        <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? 'text-primary-600' : 'text-gray-400'}`} />
        
        {isUploading ? (
          <p className="text-sm text-gray-600">アップロード中...</p>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-1">
              ファイルをドラッグ&ドロップまたはクリックしてアップロード
            </p>
            <p className="text-xs text-gray-500">
              対応形式: {allowedTypes.join(', ')} (最大{maxSize}MB)
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

interface FileListProps {
  files: UploadedFile[];
  onFileDeleted?: (fileId: string) => void;
  showDownload?: boolean;
}

const FileList: React.FC<FileListProps> = ({
  files,
  onFileDeleted,
  showDownload = true
}) => {
  const handleDelete = (fileId: string) => {
    if (confirm('このファイルを削除しますか？')) {
      deleteFile(fileId);
      onFileDeleted?.(fileId);
    }
  };

  const handleDownload = (file: UploadedFile) => {
    downloadFile(file);
  };

  const getFileIcon = (file: UploadedFile) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4 text-gray-400" />;
    }
    return <FileText className="w-4 h-4 text-gray-400" />;
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">アップロードされたファイルはありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div key={file.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          {getFileIcon(file)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString('ja-JP')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {showDownload && (
              <button
                onClick={() => handleDownload(file)}
                className="text-primary-600 hover:text-primary-700"
                title="ダウンロード"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleDelete(file.id)}
              className="text-red-600 hover:text-red-700"
              title="削除"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export { FileUploadArea, FileList };

