import { ArrowLeft } from 'lucide-react';
import { MediaGallerySection } from '../components/MediaGallerySection';

export function GalleryPage() {
  const goBack = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-yellow-300">
      <div className="site-shell pt-24">
        <button
          onClick={goBack}
          className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] font-semibold text-black border-b border-black/30 pb-2 hover:text-black/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          戻る
        </button>
        <div className="mb-6 bg-white/90 border border-black/10 px-5 py-4 text-sm text-black/70 font-semibold rounded-2xl">
          スマホ：写真はサムネイルをタップすると別タブで開きます。動画は「↓ 開いて保存」をタップすると別タブで開くので、右下の...から保存を選択してください（iPhoneは“ファイル”に保存されます）。
        </div>
      </div>

      <MediaGallerySection />
    </div>
  );
}
