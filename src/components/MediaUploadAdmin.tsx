import { useEffect, useState } from 'react';
import { GolfMediaUpload } from '../lib/supabase';
import { mediaSupabase, isMediaSupabaseConfigured } from '../lib/mediaSupabase';
import { Image as ImageIcon, Video, Trash2, RefreshCw } from 'lucide-react';

const TABLE_NAME = 'golf_media_uploads';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_EXTENSION_PATTERN = /\.(jpg|jpeg|png|webp|heic|mp4|mov)$/i;

type MediaItem = GolfMediaUpload & { displayUrl: string; previewUrl: string; mediaType: 'image' | 'video' };

const formatDate = (value: string) =>
  new Date(value).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatBytes = (bytes: number | null) => {
  if (!bytes) return '-';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  const precision = value >= 10 || index === 0 ? 0 : 1;
  return `${value.toFixed(precision)}${units[index]}`;
};

export function MediaUploadAdmin() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMedia = async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    }
    setError('');
    if (!isMediaSupabaseConfigured || !mediaSupabase) {
      setError('メディア用のSupabase設定が見つかりません。');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const { data, error: fetchError } = await mediaSupabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const items = (data || []).map((item) => {
        const isVideo = item.cloudinary_resource_type === 'video' || item.file_type?.startsWith('video/');
        const resourceType = isVideo ? 'video' : 'image';
        const rawPublicId = item.cloudinary_public_id || item.file_path || '';
        const normalizedPublicId = rawPublicId.replace(CLOUDINARY_EXTENSION_PATTERN, '');
        const cloudinaryUrl = item.cloudinary_url
          || (CLOUDINARY_CLOUD_NAME && normalizedPublicId
            ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload/${normalizedPublicId}`
            : '');
        const directUrl = item.file_path?.startsWith('http') ? item.file_path : '';
        const fallbackUrl = item.file_path
          ? mediaSupabase.storage.from('kiramucup-uploads').getPublicUrl(item.file_path).data.publicUrl
          : '';

        const displayUrl = cloudinaryUrl || directUrl || fallbackUrl;
        const previewUrl = isVideo && CLOUDINARY_CLOUD_NAME && normalizedPublicId
          ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/so_0/${normalizedPublicId}.jpg`
          : displayUrl;

        return {
          ...item,
          displayUrl,
          previewUrl,
          mediaType: resourceType,
        };
      });

      setMediaItems(items);
    } catch (err) {
      console.error('Failed to fetch media:', err);
      setError('アップロード一覧の取得に失敗しました。');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMedia();

    if (!isMediaSupabaseConfigured || !mediaSupabase) {
      return;
    }

    const channel = mediaSupabase
      .channel('media_admin_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE_NAME },
        () => fetchMedia()
      )
      .subscribe();

    return () => {
      mediaSupabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (item: MediaItem) => {
    if (!window.confirm(`${item.original_name} を削除しますか？`)) {
      return;
    }

    setError('');
    setDeletingId(item.id);

    try {
      if (!mediaSupabase) {
        throw new Error('media_supabase_not_configured');
      }

      if (item.cloudinary_url || item.cloudinary_public_id) {
        const response = await fetch('/.netlify/functions/cloudinary-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            publicId: item.cloudinary_public_id || item.file_path,
            resourceType: item.cloudinary_resource_type === 'video' ? 'video' : 'image',
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || data?.result !== 'ok') {
          throw new Error(data?.error?.message || 'Cloudinary delete failed');
        }
      } else if (item.file_path) {
        const { error: removeError } = await mediaSupabase.storage
          .from('kiramucup-uploads')
          .remove([item.file_path]);

        if (removeError) throw removeError;
      }

      const { error: deleteError } = await mediaSupabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', item.id);

      if (deleteError) throw deleteError;

      setMediaItems((prev) => prev.filter((media) => media.id !== item.id));
    } catch (err) {
      console.error('Failed to delete media:', err);
      setError('削除に失敗しました。時間をおいてもう一度お試しください。');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-12">
      <div className="bg-white border-4 border-black p-6 md:p-8" style={{ boxShadow: '8px 8px 0 0 var(--shadow-color)' }}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-3xl md:text-4xl font-black text-black uppercase">
            メディア管理
          </h2>
          <button
            type="button"
            onClick={() => fetchMedia(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border-4 border-black bg-yellow-300 text-black font-black uppercase hover:translate-x-0.5 hover:translate-y-0.5 transition-transform disabled:opacity-50"
            style={{ boxShadow: '4px 4px 0 0 var(--shadow-color)' }}
          >
            <RefreshCw className="w-4 h-4" />
            {refreshing ? '更新中...' : '更新'}
          </button>
        </div>

        {error && (
          <div className="bg-red-400 border-4 border-black text-black px-4 py-3 mb-6 font-bold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-black text-lg font-black">読み込み中...</div>
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="text-center py-12 text-black font-bold">
            まだアップロードがありません
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {mediaItems.map((item) => {
              const isImage = item.mediaType === 'image';
              const Icon = isImage ? ImageIcon : Video;
              return (
                <div
                  key={item.id}
                  className="border-4 border-black bg-yellow-300 overflow-hidden"
                  style={{ boxShadow: '6px 6px 0 0 var(--shadow-color)' }}
                >
                  <div className="border-b-4 border-black bg-black">
                    {isImage ? (
                      <img
                        src={item.displayUrl}
                        alt={item.original_name}
                        className="w-full h-56 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <img
                        src={item.previewUrl}
                        alt={item.original_name}
                        className="w-full h-56 object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="p-4 bg-white border-t-4 border-black">
                    <div className="flex items-center gap-2 text-black font-bold mb-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm uppercase">{isImage ? 'PHOTO' : 'VIDEO'}</span>
                    </div>
                    <div className="text-sm font-bold text-black mb-1">
                      {item.uploader_name ? item.uploader_name : '匿名'}
                    </div>
                    {item.comment && (
                      <div className="text-sm text-black font-bold mb-2">{item.comment}</div>
                    )}
                    <div className="text-xs text-black font-bold mb-3">
                      {formatDate(item.created_at)} / {formatBytes(item.file_size ?? null)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-400 text-black hover:translate-x-0.5 hover:translate-y-0.5 border-4 border-black font-black uppercase transition-transform disabled:opacity-50"
                      style={{ boxShadow: '4px 4px 0 0 var(--shadow-color)' }}
                    >
                      <Trash2 className="w-4 h-4" />
                      {deletingId === item.id ? '削除中...' : '削除'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
