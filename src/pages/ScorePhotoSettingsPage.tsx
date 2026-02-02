import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { isMediaSupabaseConfigured, mediaSupabase } from '../lib/mediaSupabase';
import { writeWatermarkCache } from '../lib/scorePhotoWatermarkCache';

const STORAGE_KEY = 'scorePhotoWatermarkSettings';
const SETTINGS_TABLE = 'score_photo_settings';
const SETTINGS_KEY = 'global';

type WatermarkSettings = {
  text: string;
  opacity: number;
  size: number;
  logoDataUrl: string;
  logoSize: number;
};
type WatermarkSettingsStorage = WatermarkSettings & {
  updatedAt?: number;
};

const defaultSettings: WatermarkSettings = {
  text: 'kiramucup2026',
  opacity: 0.35,
  size: 28,
  logoDataUrl: '',
  logoSize: 140,
};

const buildLocalPayload = (settings: WatermarkSettings, updatedAt?: number): WatermarkSettingsStorage => ({
  ...settings,
  updatedAt,
});

const loadSettings = () => {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultSettings;
    const parsed = JSON.parse(stored) as Partial<WatermarkSettingsStorage>;
    const { updatedAt: _updatedAt, ...rest } = parsed;
    return {
      ...defaultSettings,
      ...rest,
    };
  } catch (error) {
    return defaultSettings;
  }
};

export function ScorePhotoSettingsPage() {
  const adminPassword = 'kiramu2026okada';
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [settings, setSettings] = useState<WatermarkSettings>(defaultSettings);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const auth = sessionStorage.getItem('scorePhotoSettingsAuth');
    if (auth === 'ok') {
      setIsAuthorized(true);
    }
    setSettings(loadSettings());
    const loadRemoteSettings = async () => {
      if (!isMediaSupabaseConfigured) return;
      const { data, error } = await mediaSupabase
        .from(SETTINGS_TABLE)
        .select('text, opacity, size, logo_data_url, logo_size, updated_at')
        .eq('settings_key', SETTINGS_KEY)
        .maybeSingle();
      if (error || !data) return;
      const parsedUpdatedAt = data.updated_at ? Date.parse(data.updated_at) : undefined;
      const updatedAt = Number.isNaN(parsedUpdatedAt ?? NaN) ? undefined : parsedUpdatedAt;
      const nextSettings = {
        ...defaultSettings,
        text: data.text ?? defaultSettings.text,
        opacity: typeof data.opacity === 'number' ? data.opacity : defaultSettings.opacity,
        size: typeof data.size === 'number' ? data.size : defaultSettings.size,
        logoDataUrl: data.logo_data_url ?? '',
        logoSize: typeof data.logo_size === 'number' ? data.logo_size : defaultSettings.logoSize,
      };
      setSettings(nextSettings);
      try {
        const localPayload = buildLocalPayload(nextSettings, updatedAt);
        writeWatermarkCache(localPayload);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(localPayload));
      } catch (storageError) {
        return;
      }
    };
    loadRemoteSettings();
  }, []);

  useEffect(() => {
    if (!isAuthorized) return;
    const updatedAt = Date.now();
    const localPayload = buildLocalPayload(settings, updatedAt);
    writeWatermarkCache(localPayload);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(localPayload));
    } catch (error) {
      // ignore local storage failures
    }
    if (!isMediaSupabaseConfigured) return;
    const timer = window.setTimeout(async () => {
      const payload = {
        settings_key: SETTINGS_KEY,
        text: settings.text,
        opacity: settings.opacity,
        size: settings.size,
        logo_data_url: settings.logoDataUrl || null,
        logo_size: settings.logoSize,
        updated_at: new Date(updatedAt).toISOString(),
      };
      await mediaSupabase.from(SETTINGS_TABLE).upsert(payload, { onConflict: 'settings_key' });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [isAuthorized, settings]);

  const goBack = () => {
    window.history.pushState({}, '', '/score-photo');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleAuthSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError('');

    if (!adminPassword) {
      setAuthError('管理者パスワードが設定されていません。');
      return;
    }

    if (password !== adminPassword) {
      setAuthError('パスワードが正しくありません。');
      setPassword('');
      return;
    }

    sessionStorage.setItem('scorePhotoSettingsAuth', 'ok');
    setIsAuthorized(true);
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setSettings((prev) => ({ ...prev, logoDataUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const persist = async () => {
      const updatedAt = Date.now();
      const localPayload = buildLocalPayload(settings, updatedAt);
      writeWatermarkCache(localPayload);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(localPayload));
      } catch (error) {
        // ignore local storage failures
      }
      if (!isMediaSupabaseConfigured) {
        setSaveMessage('保存しました（この端末のみ）');
        setTimeout(() => setSaveMessage(''), 2000);
        return;
      }
      const payload = {
        settings_key: SETTINGS_KEY,
        text: settings.text,
        opacity: settings.opacity,
        size: settings.size,
        logo_data_url: settings.logoDataUrl || null,
        logo_size: settings.logoSize,
        updated_at: new Date(updatedAt).toISOString(),
      };
      const { error } = await mediaSupabase
        .from(SETTINGS_TABLE)
        .upsert(payload, { onConflict: 'settings_key' });
      if (error) {
        setSaveMessage('保存に失敗しました');
        setTimeout(() => setSaveMessage(''), 2000);
        return;
      }
      setSaveMessage('保存しました（全端末に反映）');
      setTimeout(() => setSaveMessage(''), 2000);
    };
    persist();
  };

  const handleClearLogo = () => {
    setSettings((prev) => ({ ...prev, logoDataUrl: '' }));
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-yellow-300 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white border-4 border-black p-8 md:p-12" style={{ boxShadow: '8px 8px 0 0 #000' }}>
            <h1 className="text-2xl font-black text-black text-center mb-6 uppercase">
              透かし設定（管理者）
            </h1>
            <form onSubmit={handleAuthSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase">
                  パスワード
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full px-4 py-3 border-4 border-black focus:outline-none font-bold"
                  placeholder="パスワードを入力"
                  required
                />
              </div>
              {authError && (
                <div className="bg-red-400 border-4 border-black text-black px-4 py-3 font-bold">
                  {authError}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-yellow-400 px-6 py-3 border-4 border-black text-black font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-transform"
                style={{ boxShadow: '6px 6px 0 0 #000' }}
              >
                ログイン
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-300">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <button
          onClick={goBack}
          className="mb-6 flex items-center gap-2 bg-yellow-400 px-6 py-3 border-4 border-black font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-transform"
          style={{ boxShadow: '4px 4px 0 0 #000' }}
        >
          <ArrowLeft className="w-5 h-5" />
          戻る
        </button>

        <div className="bg-white border-4 border-black p-6 md:p-8" style={{ boxShadow: '8px 8px 0 0 #000' }}>
          <h1 className="text-2xl md:text-3xl font-black text-black mb-6 uppercase">
            透かし設定
          </h1>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase">透かし文字</label>
              <input
                type="text"
                value={settings.text}
                onChange={(event) => setSettings((prev) => ({ ...prev, text: event.target.value }))}
                className="w-full px-4 py-3 border-4 border-black focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase">透かしロゴ（任意）</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full border-4 border-black bg-yellow-100 px-4 py-3 font-bold"
              />
              {settings.logoDataUrl && (
                <div className="mt-3 flex items-center gap-3">
                  <img src={settings.logoDataUrl} alt="watermark preview" className="h-12 w-auto border-2 border-black" />
                  <button
                    type="button"
                    onClick={handleClearLogo}
                    className="px-3 py-2 border-2 border-black bg-red-400 text-black text-xs font-black uppercase hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
                    style={{ boxShadow: '3px 3px 0 0 #000' }}
                  >
                    クリア
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase">透かし濃度</label>
              <input
                type="range"
                min={10}
                max={80}
                value={Math.round(settings.opacity * 100)}
                onChange={(event) => setSettings((prev) => ({ ...prev, opacity: Number(event.target.value) / 100 }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase">透かし文字サイズ</label>
              <input
                type="range"
                min={18}
                max={42}
                value={settings.size}
                onChange={(event) => setSettings((prev) => ({ ...prev, size: Number(event.target.value) }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase">透かしロゴサイズ</label>
              <input
                type="range"
                min={60}
                max={220}
                value={settings.logoSize}
                onChange={(event) => setSettings((prev) => ({ ...prev, logoSize: Number(event.target.value) }))}
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 bg-yellow-400 px-6 py-3 border-4 border-black text-black font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-transform"
              style={{ boxShadow: '6px 6px 0 0 #000' }}
            >
              <Save className="w-4 h-4" />
              保存する
            </button>
            {saveMessage && <span className="text-black font-bold">{saveMessage}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
