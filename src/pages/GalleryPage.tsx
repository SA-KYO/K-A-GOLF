import { ArrowLeft } from 'lucide-react';
import { MediaGallerySection } from '../components/MediaGallerySection';

export function GalleryPage() {
  const goBack = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="site-shell pt-24">
        <button
          onClick={goBack}
          className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] font-semibold text-white/80 border-b border-white/20 pb-2 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          戻る
        </button>
        <div className="mb-12 bg-white/5 border border-white/10 px-6 py-4 text-sm text-gray-400 rounded-xl backdrop-blur-sm">
          <p className="leading-relaxed">
            <span className="text-[#3d7a35] font-semibold">スマホ：</span>写真はサムネイルをタップすると別タブで開きます。動画は「↓ 開いて保存」をタップすると別タブで開くので、右下の...から保存を選択してください（iPhoneは"ファイル"に保存されます）。
          </p>
        </div>
      </div>

      <MediaGallerySection />
    </div>
  );
}
