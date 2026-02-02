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
    normalImages: string[];
    activeImages?: string[];
    normalFrames?: number[];
    activeFrames?: number[];
    flipX?: boolean;
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
