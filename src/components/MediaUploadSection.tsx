import { useMemo, useState } from 'react';
import { mediaSupabase, isMediaSupabaseConfigured } from '../lib/mediaSupabase';
import { UploadCloud, Image as ImageIcon, Video, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_FOLDER = import.meta.env.VITE_CLOUDINARY_FOLDER || 'kiramucup2026';
const CLOUDINARY_TAGS = import.meta.env.VITE_CLOUDINARY_TAGS || '';
const TABLE_NAME = 'golf_media_uploads';
const MAX_FILES = 10;
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  const precision = value >= 10 || index === 0 ? 0 : 1;
  return `${value.toFixed(precision)}${units[index]}`;
};

type UploadResult = {
  public_id: string;
  secure_url: string;
  resource_type: string;
  bytes: number;
  delete_token?: string;
};

const uploadToCloudinary = (file: File, onProgress?: (loaded: number, total: number) => void) =>
  new Promise<UploadResult>((resolve, reject) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      reject(new Error('cloudinary_config_missing'));
      return;
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', CLOUDINARY_FOLDER);
    if (CLOUDINARY_TAGS) {
      formData.append('tags', CLOUDINARY_TAGS);
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint);

    xhr.upload.addEventListener('progress', (event) => {
      if (!onProgress || !event.lengthComputable) return;
      onProgress(event.loaded, event.total);
    });

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText || '{}');
        if (xhr.status < 200 || xhr.status >= 300 || data?.error) {
          const message = data?.error?.message || 'Cloudinary upload failed';
          reject(new Error(message));
          return;
        }
        resolve(data as UploadResult);
      } catch (error) {
        reject(new Error('Cloudinary response parse failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Cloudinary upload failed'));
    xhr.send(formData);
  });

export function MediaUploadSection() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploaderName, setUploaderName] = useState('');
  const [comment, setComment] = useState('');
  const [agreedToShare, setAgreedToShare] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState<number | null>(null);

  const goToGallery = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    window.history.pushState({}, '', '/gallery');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const totalSize = useMemo(
    () => selectedFiles.reduce((sum, file) => sum + file.size, 0),
    [selectedFiles]
  );

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const incomingFiles = Array.from(fileList);
    const nextFiles: File[] = [];
    const errors: string[] = [];

    incomingFiles.forEach((file) => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        errors.push(`「${file.name}」は画像・動画のみ対応しています。`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`「${file.name}」は${formatBytes(MAX_FILE_SIZE)}を超えています。`);
        return;
      }
      nextFiles.push(file);
    });

    const remainingSlots = MAX_FILES - selectedFiles.length;
    if (remainingSlots <= 0) {
      errors.push(`アップロードは最大${MAX_FILES}件までです。`);
    }

    const filesToAdd = remainingSlots > 0 ? nextFiles.slice(0, remainingSlots) : [];
    if (nextFiles.length > remainingSlots) {
      errors.push(`選択できるのは最大${MAX_FILES}件までです。`);
    }

    if (filesToAdd.length > 0) {
      setSelectedFiles((prev) => [...prev, ...filesToAdd]);
      setIsSubmitted(false);
      if (!isSubmitting) {
        setUploadProgress([]);
        setOverallProgress(0);
        setCurrentFileIndex(null);
      }
    }

    setError(errors.join(' '));
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    addFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
    setError('');
    if (!isSubmitting) {
      setUploadProgress((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
      setOverallProgress(0);
      setCurrentFileIndex(null);
    }
  };

  const handleClearFiles = () => {
    setSelectedFiles([]);
    setError('');
    if (!isSubmitting) {
      setUploadProgress([]);
      setOverallProgress(0);
      setCurrentFileIndex(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (selectedFiles.length === 0) {
      setError('アップロードするファイルを選択してください。');
      return;
    }

    if (!agreedToShare) {
      setError('公開に関する注意事項へ同意してください。');
      return;
    }

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      setError('Cloudinaryの設定が見つかりません。環境変数を確認してください。');
      return;
    }

    if (!isMediaSupabaseConfigured) {
      setError('メディア用のSupabase設定が見つかりません。');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(Array(selectedFiles.length).fill(0));
    setOverallProgress(0);
    setCurrentFileIndex(0);

    try {
      let successfulUploads = 0;
      const loadedByFile = Array(selectedFiles.length).fill(0);

      for (let index = 0; index < selectedFiles.length; index += 1) {
        const file = selectedFiles[index];
        setCurrentFileIndex(index);
        const uploadResult = await uploadToCloudinary(file, (loaded, total) => {
          loadedByFile[index] = loaded;
          setUploadProgress((prev) => {
            const next = [...prev];
            const percent = total ? Math.round((loaded / total) * 100) : 0;
            next[index] = Math.min(100, Math.max(0, percent));
            return next;
          });
          const totalLoaded = loadedByFile.reduce((sum, value) => sum + value, 0);
          const percent = totalSize ? Math.round((totalLoaded / totalSize) * 100) : 0;
          setOverallProgress(Math.min(100, Math.max(0, percent)));
        });

        loadedByFile[index] = file.size;
        setUploadProgress((prev) => {
          const next = [...prev];
          next[index] = 100;
          return next;
        });
        const totalLoaded = loadedByFile.reduce((sum, value) => sum + value, 0);
        const percent = totalSize ? Math.round((totalLoaded / totalSize) * 100) : 0;
        setOverallProgress(Math.min(100, Math.max(0, percent)));

        const { error: insertError } = await mediaSupabase
          .from(TABLE_NAME)
          .insert([
            {
              uploader_name: uploaderName || null,
              comment: comment || null,
              file_path: uploadResult.public_id,
              original_name: file.name,
              file_type: file.type || null,
              file_size: uploadResult.bytes ?? file.size,
              cloudinary_public_id: uploadResult.public_id,
              cloudinary_url: uploadResult.secure_url,
              cloudinary_delete_token: uploadResult.delete_token || null,
              cloudinary_resource_type: uploadResult.resource_type || null,
            },
          ]);

        if (insertError) {
          throw insertError;
        }

        successfulUploads += 1;
      }

      setUploadedCount(successfulUploads);
      setIsSubmitted(true);
      setSelectedFiles([]);
      setUploaderName('');
      setComment('');
      setAgreedToShare(false);
      setUploadProgress([]);
      setOverallProgress(0);
      setCurrentFileIndex(null);
    } catch (err) {
      console.error('Upload failed:', err);
      if (err instanceof Error && err.message) {
        setError(`アップロードに失敗しました。${err.message}`);
      } else {
        setError('アップロードに失敗しました。時間をおいてもう一度お試しください。');
      }
    } finally {
      setIsSubmitting(false);
      setCurrentFileIndex(null);
    }
  };

  return (
    <section id="media-upload" className="py-20 px-4 bg-yellow-300 scroll-mt-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black mb-4 uppercase" style={{ color: '#22C55E' }}>
            写真・動画アップロード
          </h2>
          <div className="w-32 h-2 mx-auto mb-6" style={{ backgroundColor: '#22C55E' }} />
          <p className="text-black text-lg font-bold">
            当日の思い出をみんなでシェアしよう
          </p>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={goToGallery}
              className="group relative w-full max-w-xl overflow-hidden border-4 border-black bg-white px-6 py-8 text-left hover:translate-x-1 hover:translate-y-1 transition-transform"
              style={{ boxShadow: '8px 8px 0 0 #000' }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: 'url(/gallery-Photo.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="absolute inset-0 bg-white/80" />
              <div className="relative flex flex-col items-center text-center gap-3">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-black bg-white"
                  style={{ boxShadow: '4px 4px 0 0 #000' }}
                >
                  <ImageIcon className="h-6 w-6 text-black" />
                </span>
                <div className="text-2xl md:text-3xl font-black text-black">ギャラリーを見る</div>
                <div className="text-sm md:text-base font-bold text-black">みんなの写真をチェック</div>
                <div className="inline-flex items-center gap-2 border-4 border-black bg-white px-4 py-2 text-sm md:text-base font-black text-black">
                  ギャラリーを開く →
                </div>
              </div>
            </button>
          </div>
        </div>

        {isSubmitted ? (
          <div className="max-w-2xl mx-auto bg-yellow-400 border-4 border-black p-8 md:p-12 text-center" style={{ boxShadow: '8px 8px 0 0 #000' }}>
            <CheckCircle2 className="w-20 h-20 text-black mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-black text-black mb-4 uppercase">
              アップロード完了！
            </h3>
            <p className="text-black mb-6 font-bold">
              {uploadedCount}件のファイルを受け付けました。ありがとうございます！
            </p>
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="bg-yellow-400 px-8 py-3 border-4 border-black hover:translate-x-1 hover:translate-y-1 transition-transform font-black uppercase"
              style={{ color: '#22C55E', boxShadow: '6px 6px 0 0 #000' }}
            >
              追加でアップロードする
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border-4 border-black p-8 md:p-12" style={{ boxShadow: '8px 8px 0 0 #000' }}>
            <h3 className="text-2xl md:text-3xl font-black text-center mb-8 text-black uppercase">
              画像・動画を送る
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase">
                  お名前（任意）
                </label>
                <input
                  type="text"
                  value={uploaderName}
                  onChange={(event) => setUploaderName(event.target.value)}
                  className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-0 font-bold"
                  placeholder="ニックネームOK"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase">
                  コメント（任意）
                </label>
                <input
                  type="text"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-0 font-bold"
                  placeholder="一言メッセージ"
                />
              </div>
            </div>

            <div className="mt-8">
              <label
                htmlFor="media-upload-input"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`flex flex-col items-center justify-center gap-3 border-4 border-black px-6 py-10 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'bg-yellow-300' : 'bg-yellow-400'
                }`}
                style={{ boxShadow: '6px 6px 0 0 #000' }}
              >
                <UploadCloud className="w-10 h-10 text-black" />
                <div className="text-lg md:text-xl font-black text-black uppercase">
                  画像・動画を選択
                </div>
                <p className="text-sm text-black font-bold">
                  クリック or ドラッグ＆ドロップで追加
                </p>
              </label>
              <input
                id="media-upload-input"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileInputChange}
                className="sr-only"
              />
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-6 bg-yellow-100 border-4 border-black p-4" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="font-black text-black">
                    選択中: {selectedFiles.length}件 / 合計 {formatBytes(totalSize)}
                  </div>
                  <button
                    type="button"
                    onClick={handleClearFiles}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 border-4 border-black bg-red-400 text-black font-black uppercase hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
                    style={{ boxShadow: '4px 4px 0 0 #000' }}
                  >
                    <Trash2 className="w-4 h-4" />
                    クリア
                  </button>
                </div>

                {isSubmitting && (
                  <div className="mt-4 border-4 border-black bg-white p-4" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                    <div className="flex items-center justify-between gap-3 text-black font-black">
                      <span>アップロード中 {currentFileIndex !== null ? currentFileIndex + 1 : 0}/{selectedFiles.length}</span>
                      <span>{overallProgress}%</span>
                    </div>
                    <div className="mt-2 h-3 border-2 border-black bg-yellow-200">
                      <div
                        className="h-full bg-yellow-400 transition-all duration-200"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4 space-y-3">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex flex-wrap items-center justify-between gap-3 border-4 border-black bg-white px-4 py-3"
                      style={{ boxShadow: '4px 4px 0 0 #000' }}
                    >
                      <div className="flex items-center gap-3">
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="w-5 h-5 text-black" />
                        ) : (
                          <Video className="w-5 h-5 text-black" />
                        )}
                        <div className="text-sm font-bold text-black">{file.name}</div>
                        <div className="text-xs text-black">{formatBytes(file.size)}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-3 py-2 border-4 border-black bg-yellow-400 text-black text-sm font-black uppercase hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
                        style={{ boxShadow: '4px 4px 0 0 #000' }}
                      >
                        <Trash2 className="w-4 h-4" />
                        削除
                      </button>
                      {isSubmitting && uploadProgress[index] !== undefined && (
                        <div className="w-full">
                          <div className="mt-2 flex items-center justify-between text-xs font-black text-black">
                            <span>送信中</span>
                            <span>{uploadProgress[index]}%</span>
                          </div>
                          <div className="mt-1 h-2 border-2 border-black bg-yellow-200">
                            <div
                              className="h-full bg-yellow-400 transition-all duration-200"
                              style={{ width: `${uploadProgress[index]}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-400 border-4 border-black text-black px-4 py-3 font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 bg-gray-50 border-4 border-black p-4" style={{ boxShadow: '4px 4px 0 0 #000' }}>
              <div className="font-black text-black mb-2 uppercase">
                アップロード条件
              </div>
              <div className="text-sm text-black font-bold space-y-1">
                <div>・画像または動画のみ対応</div>
                <div>・1ファイル最大 {formatBytes(MAX_FILE_SIZE)}</div>
                <div>・最大 {MAX_FILES}件まで</div>
              </div>
            </div>

            <label className="mt-6 flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToShare}
                onChange={(event) => setAgreedToShare(event.target.checked)}
                className="w-5 h-5 border-4 border-black cursor-pointer accent-yellow-400 focus:ring-2 focus:ring-black"
                style={{ minWidth: '20px', minHeight: '20px' }}
              />
              <span className="font-bold text-black text-sm md:text-base select-none">
                アップロード内容がギャラリー等で公開される可能性があることに同意します
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting || selectedFiles.length === 0 || !agreedToShare}
              className="mt-6 w-full bg-yellow-400 text-black py-4 border-4 border-black hover:translate-x-1 hover:translate-y-1 transition-transform font-black text-lg uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: '6px 6px 0 0 #000' }}
            >
              {isSubmitting ? 'アップロード中...' : 'アップロードする'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
