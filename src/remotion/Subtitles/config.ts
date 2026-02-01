// public/subtitles/config.json の型定義
export type SubtitleConfig = {
  vvprojPath: string;
  wavPath?: string;
  backgroundColor?: string;
  textColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  paddingBottom?: number;
  // 口パクのアクティブ区間を近接結合するためのしきい値（フレーム）
  activeMergeGapFrames?: number;
  speakers?: Array<{
    speakerId: string;
    textColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    fontSize?: number;
    fontFamily?: string;
  }>;
  characters?: Array<{
    id?: string;
    speakerId: string;
    imagePath: string;
    activeImagePath?: string;
    activeImagePath2?: string;
    flipX?: boolean;
    // 発話中の切替間隔（フレーム）
    activeToggleFrames?: number;
    position: {
      x: number;
      y: number;
    };
    width: number;
    height: number;
  }>;
};
