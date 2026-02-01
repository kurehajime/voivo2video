import { enableTailwind } from "@remotion/tailwind-v4";

/**
 *  @param {import('webpack').Configuration} currentConfig
 */
export const webpackOverride = (currentConfig) => {
  // Remotion の webpack に Tailwind を有効化
  return enableTailwind(currentConfig);
};
