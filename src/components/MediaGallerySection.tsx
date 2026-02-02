import { useEffect, useMemo, useState } from 'react';
import { GolfMediaUpload } from '../lib/supabase';
import { mediaSupabase, isMediaSupabaseConfigured } from '../lib/mediaSupabase';
import { Image as ImageIcon, Video, ExternalLink } from 'lucide-react';

const TABLE_NAME = 'golf_media_uploads';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_EXTENSION_PATTERN = /\.(jpg|jpeg|png|webp|heic|mp4|mov)$/i;

const appendCacheBuster = (url: string, token: string) => {
  if (!url) return url;
  return url.includes('?') ? `${url}&cb=${token}` : `${url}?cb=${token}`;
};

type MediaItem = GolfMediaUpload & { displayUrl: string; previewUrl: string; mediaType: 'image' | 'video' };

const formatDate = (value: string) =>
  new Date(value).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export function MediaGallerySection() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const cacheBuster = useMemo(() => Date.now().toString(), []);

  const fetchMedia = async () => {
    setError('');
    if (!isMediaSupabaseConfigured || !mediaSupabase) {
      setError('メディア用のSupabase設定が見つかりません。');
      setLoading(false);
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

        const baseUrl = cloudinaryUrl || directUrl || fallbackUrl;
        const displayUrl = appendCacheBuster(baseUrl, cacheBuster);
        const previewUrl = isVideo && CLOUDINARY_CLOUD_NAME && normalizedPublicId
          ? appendCacheBuster(
            `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/so_0/${normalizedPublicId}.jpg`,
            cacheBuster
          )
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
      setError('ギャラリーの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();

    if (!isMediaSupabaseConfigured || !mediaSupabase) {
      return;
    }

    const channel = mediaSupabase
      .channel('media_gallery_changes')
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

  const visibleItems = useMemo(
    () => mediaItems.filter((item) => !hiddenIds.has(item.id)),
    [mediaItems, hiddenIds]
  );
  const photoCount = useMemo(
    () => visibleItems.filter((item) => item.mediaType === 'image').length,
    [visibleItems]
  );
  const videoCount = useMemo(
    () => visibleItems.filter((item) => item.mediaType === 'video').length,
    [visibleItems]
  );
  const filteredItems = useMemo(
    () => visibleItems.filter((item) => item.mediaType === activeTab),
    [visibleItems, activeTab]
  );
  const hasFilteredItems = useMemo(() => filteredItems.length > 0, [filteredItems.length]);

  const handlePreviewError = (id: string) => {
    setHiddenIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <section id="media-gallery" className="section-wrap bg-yellow-400">
      <div className="site-shell">
        <div className="section-header">
          <span className="section-eyebrow">GALLERY</span>
          <h2 className="section-title text-black">ギャラリー</h2>
          <p className="text-base md:text-lg text-black/70 font-semibold">
            みんなの写真・動画がここに集まります
          </p>
          <div className="section-line" />
        </div>

        {loading ? (
          <div className="text-center text-black font-black">読み込み中...</div>
        ) : error ? (
          <div className="max-w-2xl mx-auto bg-red-400 border-4 border-black text-black px-4 py-3 font-bold text-center">
            {error}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-4 mb-10" role="tablist" aria-label="ギャラリー切り替え">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'image'}
                onClick={() => setActiveTab('image')}
                className={`flex items-center gap-2 px-6 py-3 border-4 border-black font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-transform ${
                  activeTab === 'image' ? 'bg-yellow-200' : 'bg-white'
                }`}
                style={{ boxShadow: '4px 4px 0 0 var(--shadow-color)' }}
              >
                <ImageIcon className="w-5 h-5" />
                写真
                <span className="bg-black text-white text-xs px-2 py-1 border-2 border-black">{photoCount}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'video'}
                onClick={() => setActiveTab('video')}
                className={`flex items-center gap-2 px-6 py-3 border-4 border-black font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-transform ${
                  activeTab === 'video' ? 'bg-yellow-200' : 'bg-white'
                }`}
                style={{ boxShadow: '4px 4px 0 0 var(--shadow-color)' }}
              >
                <Video className="w-5 h-5" />
                動画
                <span className="bg-black text-white text-xs px-2 py-1 border-2 border-black">{videoCount}</span>
              </button>
            </div>

            {!hasFilteredItems ? (
              <div className="max-w-2xl mx-auto bg-white border-4 border-black p-8 text-center font-bold text-black" style={{ boxShadow: '6px 6px 0 0 var(--shadow-color)' }}>
                {activeTab === 'image'
                  ? '表示できる写真がありません。ぜひ思い出を投稿してください！'
                  : '表示できる動画がありません。ぜひ思い出を投稿してください！'}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
              const isImage = item.mediaType === 'image';
              const Icon = isImage ? ImageIcon : Video;
              return (
                <div
                  key={item.id}
                  className="bg-white border-4 border-black overflow-hidden"
                  style={{ boxShadow: '6px 6px 0 0 var(--shadow-color)' }}
                >
                  <div className="border-b-4 border-black bg-black">
                    {isImage ? (
                      <a
                        href={item.displayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block relative"
                        aria-label="別タブで拡大表示"
                      >
                        <img
                          src={item.displayUrl}
                          alt={item.original_name}
                          className="w-full h-56 object-cover"
                          loading="lazy"
                          onError={() => handlePreviewError(item.id)}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-yellow-400 text-black border-2 border-black px-2 py-1 text-xs font-black uppercase">
                          <ExternalLink className="w-3 h-3" />
                          拡大
                        </div>
                      </a>
                    ) : (
                      <div className="relative">
                        <img
                          src={item.previewUrl}
                          alt={item.original_name}
                          className="w-full h-56 object-cover"
                          loading="lazy"
                          onError={() => handlePreviewError(item.id)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 text-black font-bold mb-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm uppercase">{isImage ? 'PHOTO' : 'VIDEO'}</span>
                    </div>
                    <div className="text-sm font-bold text-black mb-2">
                      {item.uploader_name ? item.uploader_name : '匿名'}
                    </div>
                    {item.comment && (
                      <div className="text-sm text-black font-bold mb-3">
                        {item.comment}
                      </div>
                    )}
                    {!isImage && (
                      <a
                        href={item.displayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={item.original_name}
                        className="mb-3 inline-flex items-center gap-2 bg-yellow-400 text-black border-2 border-black px-3 py-2 text-xs font-black uppercase hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
                        style={{ boxShadow: '3px 3px 0 0 var(--shadow-color)' }}
                      >
                        ↓ 開いて保存
                      </a>
                    )}
                    <div className="text-xs text-black font-bold">
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
