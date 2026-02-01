import { Input, ALL_FORMATS, UrlSource } from "mediabunny";

// staticFile の URL から音声長（秒）を取得する
export const getAudioDuration = async (src: string): Promise<number> => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(src, {
      getRetryDelay: () => null,
    }),
  });

  return input.computeDuration();
};
