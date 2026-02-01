// モーラ単位の長さ情報（秒）
export type VvprojMora = {
  consonantLength?: number | null;
  vowelLength?: number | null;
  pitch?: number | null;
};

// アクセント句。mora の列と句間ポーズを持つ
export type VvprojAccentPhrase = {
  moras?: VvprojMora[];
  pauseMora?: VvprojMora | null;
  isInterrogative?: boolean;
};

// VOICEVOX の AudioQuery 相当（時間算出に必要な最小フィールド）
export type VvprojAudioQuery = {
  accentPhrases?: VvprojAccentPhrase[];
  prePhonemeLength?: number | null;
  postPhonemeLength?: number | null;
  speedScale?: number | null;
  pauseLengthScale?: number | null;
};

// talk.audioItems の要素
export type VvprojAudioItem = {
  text?: string | null;
  voice?: {
    speakerId?: string | null;
  } | null;
  query?: VvprojAudioQuery | null;
};

// vvproj のうち talk セクションのみを扱う
export type Vvproj = {
  talk?: {
    audioKeys?: string[];
    audioItemKeys?: string[];
    audioItems?: Record<string, VvprojAudioItem>;
  };
};

// 不正値は 0 として扱う
const numberOrZero = (value: number | null | undefined): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

// query から「設計上の発話時間（秒）」を合算する
export const calcQueryDurationSec = (
  query?: VvprojAudioQuery | null,
  speedScaleMode: "all" | "phonemeOnly" = "all",
): number => {
  if (!query) {
    return 0;
  }

  let total = 0;
  let phonemeTotal = 0;
  const pauseScale = numberOrZero(query.pauseLengthScale ?? 1) || 1;
  total += numberOrZero(query.prePhonemeLength ?? 0);
  total += numberOrZero(query.postPhonemeLength ?? 0);

  for (const phrase of query.accentPhrases ?? []) {
    for (const mora of phrase.moras ?? []) {
      phonemeTotal += numberOrZero(mora.consonantLength ?? 0);
      phonemeTotal += numberOrZero(mora.vowelLength ?? 0);
    }

    if (phrase.pauseMora) {
      phonemeTotal += numberOrZero(phrase.pauseMora.vowelLength ?? 0) * pauseScale;
    }

    if (phrase.isInterrogative) {
      const moras = phrase.moras ?? [];
      const last = moras[moras.length - 1];
      if (last && numberOrZero(last.pitch ?? 0) > 0) {
        // VOICEVOX 側の疑問形上げ（固定 0.15s）を加算
        phonemeTotal += 0.15;
      }
    }
  }

  // 話速が速いほど時間は短くなるため、最後に割る
  const speedScale = numberOrZero(query.speedScale ?? 1) || 1;
  if (speedScaleMode === "phonemeOnly") {
    total += phonemeTotal / speedScale;
    return total;
  }
  total += phonemeTotal;
  return total / speedScale;
};

// セリフ単位のタイムライン情報
export type TalkLine = {
  key: string;
  text: string;
  speakerId: string | null;
  prePhonemeLength: number;
  postPhonemeLength: number;
  speedScale: number;
  startSec: number;
  endSec: number;
  durationSec: number;
};

// audioKeys の順序でセリフ配列を作成する
export const getTalkLines = (
  vvproj: Vvproj,
  speedScaleMode: "all" | "phonemeOnly" = "all",
): TalkLine[] => {
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
    const query = item.query ?? undefined;
    const durationSec = calcQueryDurationSec(query, speedScaleMode);
    const startSec = cursor;
    const endSec = startSec + durationSec;
    const prePhonemeLength =
      typeof query?.prePhonemeLength === "number"
        ? query.prePhonemeLength
        : 0;
    const postPhonemeLength =
      typeof query?.postPhonemeLength === "number"
        ? query.postPhonemeLength
        : 0;
    const speedScale =
      typeof query?.speedScale === "number" && Number.isFinite(query.speedScale)
        ? query.speedScale
        : 1;

    lines.push({
      key,
      text: item.text ?? "",
      speakerId: item.voice?.speakerId ?? null,
      prePhonemeLength,
      postPhonemeLength,
      speedScale,
      startSec,
      endSec,
      durationSec,
    });

    cursor = endSec;
  }

  return lines;
};

// 最後のセリフ終了時刻を返す
export const getTalkEndSeconds = (
  vvproj: Vvproj,
  speedScaleMode: "all" | "phonemeOnly" = "all",
): number => {
  const lines = getTalkLines(vvproj, speedScaleMode);
  if (lines.length === 0) {
    return 0;
  }

  return lines[lines.length - 1].endSec;
};
