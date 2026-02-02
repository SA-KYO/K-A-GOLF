export type WatermarkSettingsCache = {
  text?: string;
  opacity?: number;
  size?: number;
  logoDataUrl?: string;
  logoSize?: number;
  updatedAt?: number;
};

let watermarkSettingsCache: WatermarkSettingsCache | null = null;

export const readWatermarkCache = () => watermarkSettingsCache;

export const writeWatermarkCache = (next: WatermarkSettingsCache) => {
  watermarkSettingsCache = { ...next };
};

export const clearWatermarkCache = () => {
  watermarkSettingsCache = null;
};
