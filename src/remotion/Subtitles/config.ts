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
  speakers?: Array<{
    speakerId: string;
    textColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    fontSize?: number;
    fontFamily?: string;
  }>;
};
