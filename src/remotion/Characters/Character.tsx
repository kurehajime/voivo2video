import { Img, useCurrentFrame, useVideoConfig } from "remotion";

// 発話中のアクティブ区間と口パク速度の情報
type Interval = {
  start: number;
  end: number;
  speedScale?: number;
};

type CharacterProps = {
  normalImages: string[];
  activeImages?: string[];
  normalFrames?: number[];
  activeFrames?: number[];
  activeIntervals?: Interval[];
  flipX?: boolean;
  position: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
};

// 現在フレームが含まれるアクティブ区間を返す
const getActiveInterval = (
  frame: number,
  intervals?: Interval[],
): Interval | null => {
  if (!intervals || intervals.length === 0) {
    return null;
  }
  for (const interval of intervals) {
    if (frame >= interval.start && frame < interval.end) {
      return interval;
    }
  }
  return null;
};

export const Character: React.FC<CharacterProps> = ({
  normalImages,
  activeImages,
  normalFrames,
  activeFrames,
  activeIntervals,
  flipX,
  position,
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const activeInterval = getActiveInterval(frame, activeIntervals);
  const active = !!activeInterval;
  const { fps } = useVideoConfig();
  const speedScale = activeInterval?.speedScale ?? 1;

  const pickImageByFrames = (
    images: string[],
    framesPerImage: number[] | undefined,
    frameCursor: number,
    frameScale = 1,
  ): string => {
    if (images.length === 0) {
      return "";
    }
    const normalizedFrames = images.map((_, index) => {
      const raw = framesPerImage?.[index] ?? framesPerImage?.[0] ?? 1;
      const safe = Math.max(1, Math.round(raw));
      return Math.max(1, Math.round(safe / frameScale));
    });
    const totalFrames = normalizedFrames.reduce((sum, value) => sum + value, 0);
    const loopFrame = ((frameCursor % totalFrames) + totalFrames) % totalFrames;

    let cursor = 0;
    for (let i = 0; i < images.length; i += 1) {
      cursor += normalizedFrames[i];
      if (loopFrame < cursor) {
        return images[i];
      }
    }
    return images[0];
  };

  let imageSrc = pickImageByFrames(normalImages, normalFrames, frame);
  if (active && activeImages && activeImages.length > 0) {
    const localFrame = frame - activeInterval.start;
    imageSrc = pickImageByFrames(activeImages, activeFrames, localFrame, speedScale);
  }

  // 発話中は縦方向にわずかに伸縮させる（口パクの勢い付け）
  const localFrame = activeInterval ? frame - activeInterval.start : 0;
  // 0.4秒サイクルを基準にし、話速で周期を変える
  const stretchCycleFrames = Math.max(
    1,
    Math.round((fps * 0.4) / speedScale),
  );
  const stretchPhase = (localFrame % stretchCycleFrames) / stretchCycleFrames;
  // cos 波で 0→1→0 を作り、滑らかな伸縮にする
  const stretchPulse = active
    ? 0.2 - 0.2 * Math.cos(stretchPhase * Math.PI * 2)
    : 0;
  const scaleY = 1 + stretchPulse * 0.02;
  const lift = stretchPulse * 2;
  const scaleX = flipX ? -1 : 1;

  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width,
        height,
        // 反転と伸縮を同時に適用
        transform: `translate(0px, ${-lift}px) scaleX(${scaleX}) scaleY(${scaleY})`,
        transformOrigin: "center bottom",
      }}
    >
      <Img
        src={imageSrc}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
        }}
      />
    </div>
  );
};
