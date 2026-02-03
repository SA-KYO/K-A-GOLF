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
    <section id="media-gallery" className="section-dark">
      <div className="site-shell">
        <div className="section-header section-header--center">
          <span className="section-eyebrow">GALLERY</span>
          <h2 className="section-jp-title font-serif-jp">ギャラリー</h2>
          <p className="text-base text-gray-400 mt-4">
            みんなの写真・動画がここに集まります
          </p>
        </div>

        {loading ? (
          <div className="text-center text-white text-lg">読み込み中...</div>
        ) : error ? (
          <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 text-center rounded-lg">
            {error}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-4 mb-16" role="tablist" aria-label="ギャラリー切り替え">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'image'}
                onClick={() => setActiveTab('image')}
                className={`flex items-center gap-3 px-8 py-4 border transition-all font-semibold tracking-wider ${
                  activeTab === 'image'
                    ? 'bg-[#3d7a35] border-[#3d7a35] text-white'
                    : 'bg-transparent border-white/20 text-gray-400 hover:border-[#3d7a35] hover:text-white'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
                <span>写真</span>
                <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full">{photoCount}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'video'}
                onClick={() => setActiveTab('video')}
                className={`flex items-center gap-3 px-8 py-4 border transition-all font-semibold tracking-wider ${
                  activeTab === 'video'
                    ? 'bg-[#3d7a35] border-[#3d7a35] text-white'
                    : 'bg-transparent border-white/20 text-gray-400 hover:border-[#3d7a35] hover:text-white'
                }`}
              >
                <Video className="w-5 h-5" />
                <span>動画</span>
                <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full">{videoCount}</span>
              </button>
            </div>

            {!hasFilteredItems ? (
              <div className="max-w-2xl mx-auto card-elegant p-12 text-center">
                <p className="text-gray-400 text-lg">
                  {activeTab === 'image'
                    ? '表示できる写真がありません。ぜひ思い出を投稿してください！'
                    : '表示できる動画がありません。ぜひ思い出を投稿してください！'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => {
              const isImage = item.mediaType === 'image';
              const Icon = isImage ? ImageIcon : Video;
              return (
                <div
                  key={item.id}
                  className="group relative bg-[#151515] border border-white/10 overflow-hidden hover:border-[#3d7a35] transition-all duration-300 hover:shadow-[0_0_30px_rgba(61,122,53,0.3)]"
                >
                  <div className="relative overflow-hidden">
                    {isImage ? (
                      <a
                        href={item.displayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block relative"
                        aria-label="別タブで拡大表示"
                      >
                        <img
                          src={item.displayUrl}
                          alt={item.original_name}
                          className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={() => handlePreviewError(item.id)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#3d7a35] text-white px-3 py-1.5 text-xs font-semibold uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ExternalLink className="w-3 h-3" />
                          拡大
                        </div>
                      </a>
                    ) : (
                      <div className="relative">
                        <img
                          src={item.previewUrl}
                          alt={item.original_name}
                          className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={() => handlePreviewError(item.id)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">
                            <Video className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-[#3d7a35] font-semibold mb-3 text-xs uppercase tracking-wider">
                      <Icon className="w-4 h-4" />
                      <span>{isImage ? 'PHOTO' : 'VIDEO'}</span>
                    </div>
                    <div className="text-base font-semibold text-white mb-2">
                      {item.uploader_name ? item.uploader_name : '匿名'}
                    </div>
                    {item.comment && (
                      <p className="text-sm text-gray-400 mb-4 leading-relaxed line-clamp-2">
                        {item.comment}
                      </p>
                    )}
                    {!isImage && (
                      <a
                        href={item.displayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={item.original_name}
                        className="mb-4 inline-flex items-center gap-2 bg-[#3d7a35] text-white px-4 py-2 text-xs font-semibold uppercase hover:bg-[#2d5a27] transition-colors"
                      >
                        ↓ 開いて保存
                      </a>
                    )}
                    <div className="text-xs text-gray-600 border-t border-white/5 pt-3 mt-3">
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
