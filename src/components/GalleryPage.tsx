import React, { useState, useEffect } from 'react';
import { GalleryImage } from '../types';
import { GalleryService } from '../services/galleryService';
import { Download, Trash2, Image as ImageIcon, Plus, X } from 'lucide-react';

interface GalleryPageProps {
  isAdmin: boolean;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ isAdmin }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const galleryImages = await GalleryService.getGalleryImages();
      setImages(galleryImages);
    } catch (error) {
      console.error('画像読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 画像ファイルのみ許可
      if (!file.type.startsWith('image/')) {
        alert('画像ファイルを選択してください');
        return;
      }
      setSelectedFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.split('.')[0]);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadTitle.trim()) {
      alert('ファイルとタイトルを入力してください');
      return;
    }

    try {
      setUploading(true);
      await GalleryService.uploadImage(
        selectedFile,
        uploadTitle.trim(),
        uploadDescription.trim() || undefined
      );
      
      // フォームをリセット
      setSelectedFile(null);
      setUploadTitle('');
      setUploadDescription('');
      setShowUploadModal(false);
      
      // 画像一覧を再読み込み
      await loadImages();
    } catch (error) {
      console.error('アップロードエラー:', error);
      alert('アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('この画像を削除しますか？')) {
      return;
    }

    try {
      await GalleryService.deleteImage(imageId);
      await loadImages();
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  const handleDownload = async (image: GalleryImage) => {
    try {
      await GalleryService.downloadImage(image);
    } catch (error) {
      console.error('ダウンロードエラー:', error);
      alert('ダウンロードに失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">画像を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-md font-semibold text-gray-900">ギャラリー</h2>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>追加</span>
          </button>
        )}
      </div>

      {/* 画像がない場合 */}
      {images.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">まだ画像がありません</h3>
          <p className="text-gray-500 text-sm">
            {isAdmin ? '最初の画像をアップロードしてみましょう' : '管理者が画像をアップロードするまでお待ちください'}
          </p>
        </div>
      )}

      {/* Pinterestライクな画像グリッド */}
      {images.length > 0 && (
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-2 space-y-2">
          {images.map((image) => (
            <div
              key={image.id}
              className="break-inside-avoid bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
            >
              {/* 画像 */}
              <div className="relative group">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                
                {/* ホバー時のアクションボタン */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-1.5">
                    <button
                      onClick={() => handleDownload(image)}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                      title="ダウンロード"
                    >
                      <Download className="w-3.5 h-3.5 text-gray-700" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="p-2 bg-red-500 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* アップロードモーダル */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">画像をアップロード</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* ファイル選択 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    画像ファイル
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                  />
                  {selectedFile && (
                    <p className="text-xs text-gray-500 mt-2">
                      選択中: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                {/* タイトル */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    タイトル *
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="画像のタイトルを入力"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* 説明 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    説明
                  </label>
                  <textarea
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="画像の説明を入力（任意）"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  />
                </div>

                {/* ボタン */}
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    disabled={uploading}
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || !uploadTitle.trim() || uploading}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {uploading ? 'アップロード中...' : 'アップロード'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
