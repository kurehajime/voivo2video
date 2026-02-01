import { z } from "zod";

export const SubtitleCompositionProps = z.object({
  configUrl: z.string(),
  mode: z.enum(["all", "subtitles", "character"]).optional(),
  characterId: z.string().optional(),
});
export const VIDEO_WIDTH = 1280;
export const VIDEO_HEIGHT = 720;
export const VIDEO_FPS = 30;
