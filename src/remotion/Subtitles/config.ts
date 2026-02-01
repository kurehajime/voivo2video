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
    flipX?: boolean;
    position: {
      x: number;
      y: number;
    };
    width: number;
    height: number;
  }>;
};
