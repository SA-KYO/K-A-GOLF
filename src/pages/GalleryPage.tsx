import { ArrowLeft } from 'lucide-react';
import { MediaGallerySection } from '../components/MediaGallerySection';

export function GalleryPage() {
  const goBack = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-yellow-300">
      <div className="max-w-6xl mx-auto px-4 pt-10">
        <button
          onClick={goBack}
          className="mb-6 flex items-center gap-2 bg-yellow-400 px-6 py-3 border-4 border-black font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-transform"
          style={{ boxShadow: '4px 4px 0 0 var(--shadow-color)' }}
        >
          <ArrowLeft className="w-5 h-5" />
          戻る
        </button>
        <div className="mb-6 bg-white border-4 border-black px-5 py-4 text-black font-bold" style={{ boxShadow: '6px 6px 0 0 var(--shadow-color)' }}>
          スマホ：写真はサムネイルをタップすると別タブで開きます。動画は「↓ 開いて保存」をタップすると別タブで開くので、右下の...から保存を選択してください（iPhoneは“ファイル”に保存されます）。
        </div>
      </div>

      <MediaGallerySection />
    </div>
  );
}
