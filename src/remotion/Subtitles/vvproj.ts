export type VvprojMora = {
  consonantLength?: number | null;
  vowelLength?: number | null;
};

export type VvprojAccentPhrase = {
  moras?: VvprojMora[];
  pauseMora?: VvprojMora | null;
};

export type VvprojAudioQuery = {
  accentPhrases?: VvprojAccentPhrase[];
  prePhonemeLength?: number | null;
  postPhonemeLength?: number | null;
};

export type VvprojAudioItem = {
  text?: string | null;
  query?: VvprojAudioQuery | null;
};

export type Vvproj = {
  talk?: {
    audioKeys?: string[];
    audioItemKeys?: string[];
    audioItems?: Record<string, VvprojAudioItem>;
  };
};

const numberOrZero = (value: number | null | undefined): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

export const calcQueryDurationSec = (query?: VvprojAudioQuery | null): number => {
  if (!query) {
    return 0;
  }

  let total = 0;
  total += numberOrZero(query.prePhonemeLength ?? 0);
  total += numberOrZero(query.postPhonemeLength ?? 0);

  for (const phrase of query.accentPhrases ?? []) {
    for (const mora of phrase.moras ?? []) {
      total += numberOrZero(mora.consonantLength ?? 0);
      total += numberOrZero(mora.vowelLength ?? 0);
    }

    if (phrase.pauseMora) {
      total += numberOrZero(phrase.pauseMora.vowelLength ?? 0);
    }
  }

  return total;
};

export type TalkLine = {
  key: string;
  text: string;
  startSec: number;
  endSec: number;
  durationSec: number;
};

export const getTalkLines = (vvproj: Vvproj): TalkLine[] => {
  const talk = vvproj.talk ?? {};
  const audioItems = talk.audioItems ?? {};
  const orderedKeys = Array.isArray(talk.audioKeys)
    ? talk.audioKeys
    : Array.isArray(talk.audioItemKeys)
      ? talk.audioItemKeys
      : Object.keys(audioItems);

  const lines: TalkLine[] = [];
  let cursor = 0;

  for (const key of orderedKeys) {
    const item = audioItems[key];
    if (!item) {
      continue;
    }
    const durationSec = calcQueryDurationSec(item.query ?? undefined);
    const startSec = cursor;
    const endSec = startSec + durationSec;

    lines.push({
      key,
      text: item.text ?? "",
      startSec,
      endSec,
      durationSec,
    });

    cursor = endSec;
  }

  return lines;
};

export const getTalkEndSeconds = (vvproj: Vvproj): number => {
  const lines = getTalkLines(vvproj);
  if (lines.length === 0) {
    return 0;
  }

  return lines[lines.length - 1].endSec;
};
