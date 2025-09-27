// ファイルアップロード用のユーティリティ
import { fileService } from '../services/fileService'

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

// ファイルをBase64に変換
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// ファイルサイズをフォーマット
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ファイルタイプをチェック
export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.some(type => {
    if (type.startsWith('.')) {
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    }
    return file.type.startsWith(type);
  });
};

// ファイルアップロード処理
export const uploadFile = async (file: File, eventId?: string, gameRecordId?: string): Promise<UploadedFile> => {
  try {
    // ファイルをBase64に変換
    const base64 = await fileToBase64(file);
    
    // Supabaseに保存
    const fileRecord = await fileService.createFile({
      name: file.name,
      size: file.size,
      type: file.type,
      url: base64,
      event_id: eventId,
      game_record_id: gameRecordId
    });

    // アプリケーションの型に変換
    const uploadedFile: UploadedFile = {
      id: fileRecord.id,
      name: fileRecord.name,
      size: fileRecord.size,
      type: fileRecord.type,
      url: fileRecord.url,
      uploadedAt: fileRecord.created_at
    };

    return uploadedFile;
  } catch (error) {
    console.error('Failed to upload file:', error);
    // フォールバック: LocalStorageに保存
    const base64 = await fileToBase64(file);
    const uploadedFile: UploadedFile = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: base64,
      uploadedAt: new Date().toISOString()
    };

    // LocalStorageに保存
    const existingFiles = getStoredFiles();
    const updatedFiles = [...existingFiles, uploadedFile];
    localStorage.setItem('takutoh_uploaded_files', JSON.stringify(updatedFiles));

    return uploadedFile;
  }
};

// アップロードされたファイルを取得
export const getStoredFiles = (): UploadedFile[] => {
  try {
    const stored = localStorage.getItem('takutoh_uploaded_files');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Supabaseからファイルを取得
export const getFiles = async (eventId?: string, gameRecordId?: string): Promise<UploadedFile[]> => {
  try {
    let fileRecords;
    if (eventId) {
      fileRecords = await fileService.getFilesByEvent(eventId);
    } else if (gameRecordId) {
      fileRecords = await fileService.getFilesByGameRecord(gameRecordId);
    } else {
      fileRecords = await fileService.getFiles();
    }

    // Supabaseのデータをアプリケーションの型に変換
    return fileRecords.map(f => ({
      id: f.id,
      name: f.name,
      size: f.size,
      type: f.type,
      url: f.url,
      uploadedAt: f.created_at
    }));
  } catch (error) {
    console.error('Failed to load files:', error);
    // フォールバック: LocalStorageから読み込み
    return getStoredFiles();
  }
};

// ファイルを削除
export const deleteFile = async (fileId: string): Promise<void> => {
  try {
    await fileService.deleteFile(fileId);
  } catch (error) {
    console.error('Failed to delete file:', error);
    // フォールバック: LocalStorageから削除
    const existingFiles = getStoredFiles();
    const updatedFiles = existingFiles.filter(file => file.id !== fileId);
    localStorage.setItem('takutoh_uploaded_files', JSON.stringify(updatedFiles));
  }
};

// ファイルダウンロード
export const downloadFile = (file: UploadedFile): void => {
  const link = document.createElement('a');
  link.href = file.url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

