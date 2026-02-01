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
  // 字幕用のCSSファイル（public 配下の相対パス）
  cssPath?: string;
  // 口パクのアクティブ区間を近接結合するためのしきい値（フレーム）
  activeMergeGapFrames?: number;
  characters?: Array<{
    id?: string;
    speakerId: string;
    imagePath: string;
    activeImagePath?: string;
    activeImagePath2?: string;
    flipX?: boolean;
    // 発話中の切替間隔（フレーム）
    activeToggleFrames?: number;
    textColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    fontSize?: number;
    fontFamily?: string;
    position: {
      x: number;
      y: number;
    };
    width: number;
    height: number;
  }>;
};
