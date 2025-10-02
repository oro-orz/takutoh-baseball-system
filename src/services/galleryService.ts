import { supabase } from '../lib/supabase';
import { GalleryImage } from '../types';

export class GalleryService {
  private static readonly BUCKET_NAME = 'gallery-images';

  /**
   * ギャラリー画像一覧を取得
   */
  static async getGalleryImages(): Promise<GalleryImage[]> {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('ギャラリー画像取得エラー:', error);
        throw error;
      }

      // 各画像のURLを取得
      const imagesWithUrls = await Promise.all(
        (data || []).map(async (image) => {
          const url = await this.getImageUrl(image.file_path);
          return {
            ...image,
            url
          };
        })
      );

      return imagesWithUrls;
    } catch (error) {
      console.error('ギャラリー画像取得エラー:', error);
      throw error;
    }
  }

  /**
   * ランダムなギャラリー画像を取得（オープニング画像用）
   */
  static async getRandomGalleryImage(): Promise<GalleryImage | null> {
    try {
      // 全画像を取得してからランダムに選択
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('ランダム画像取得エラー:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return null;
      }

      // ランダムに1つ選択
      const randomIndex = Math.floor(Math.random() * data.length);
      const image = data[randomIndex];
      const url = await this.getImageUrl(image.file_path);
      
      return {
        ...image,
        url
      };
    } catch (error) {
      console.error('ランダム画像取得エラー:', error);
      return null;
    }
  }

  /**
   * 画像をアップロード
   */
  static async uploadImage(
    file: File,
    title: string,
    description?: string
  ): Promise<GalleryImage> {
    try {
      // ファイル名を生成（重複回避）
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const filePath = `${fileName}`;

      // Supabase Storageにアップロード
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('画像アップロードエラー:', uploadError);
        throw uploadError;
      }

      // 画像のサイズを取得
      const imageSize = await this.getImageDimensions(file);

      // データベースに記録
      const { data: dbData, error: dbError } = await supabase
        .from('gallery_images')
        .insert({
          title,
          description: description || null,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          width: imageSize.width,
          height: imageSize.height,
          is_active: true
        })
        .select()
        .single();

      if (dbError) {
        console.error('データベース保存エラー:', dbError);
        // アップロードしたファイルを削除
        await supabase.storage
          .from(this.BUCKET_NAME)
          .remove([filePath]);
        throw dbError;
      }

      // URLを取得して返す
      const url = await this.getImageUrl(filePath);
      return {
        ...dbData,
        url
      };
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      throw error;
    }
  }

  /**
   * 画像を削除
   */
  static async deleteImage(imageId: string): Promise<void> {
    try {
      // データベースから画像情報を取得
      const { data: imageData, error: fetchError } = await supabase
        .from('gallery_images')
        .select('file_path')
        .eq('id', imageId)
        .single();

      if (fetchError) {
        console.error('画像情報取得エラー:', fetchError);
        throw fetchError;
      }

      // データベースから削除
      const { error: dbError } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', imageId);

      if (dbError) {
        console.error('データベース削除エラー:', dbError);
        throw dbError;
      }

      // ストレージから削除
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([imageData.file_path]);

      if (storageError) {
        console.error('ストレージ削除エラー:', storageError);
        // データベースは削除済みなので、エラーをログに記録するだけ
        console.warn('ストレージからの削除に失敗しましたが、データベースからは削除されました');
      }
    } catch (error) {
      console.error('画像削除エラー:', error);
      throw error;
    }
  }

  /**
   * 画像のURLを取得
   */
  static async getImageUrl(filePath: string): Promise<string> {
    try {
      const { data } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('画像URL取得エラー:', error);
      throw error;
    }
  }

  /**
   * 画像のサイズを取得
   */
  private static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      img.onerror = () => {
        reject(new Error('画像の読み込みに失敗しました'));
      };
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 画像をダウンロード
   */
  static async downloadImage(image: GalleryImage): Promise<void> {
    try {
      if (!image.url) {
        throw new Error('画像URLが取得できません');
      }

      // 画像を取得
      const response = await fetch(image.url);
      const blob = await response.blob();

      // ダウンロード用のリンクを作成
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = image.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('画像ダウンロードエラー:', error);
      throw error;
    }
  }
}
