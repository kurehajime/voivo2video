import { Img, useCurrentFrame, useVideoConfig } from "remotion";

type Interval = {
  start: number;
  end: number;
  toggleFrames?: number;
  speedScale?: number;
};

type CharacterProps = {
  src: string;
  activeSrc?: string;
  activeSrc2?: string;
  activeIntervals?: Interval[];
  flipX?: boolean;
  activeToggleFrames?: number;
  position: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
};

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
  src,
  activeSrc,
  activeSrc2,
  activeIntervals,
  flipX,
  activeToggleFrames,
  position,
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const activeInterval = getActiveInterval(frame, activeIntervals);
  const active = !!activeInterval;
  const { fps } = useVideoConfig();
  const toggleFrames = activeInterval?.toggleFrames ?? activeToggleFrames ?? 6;
  const activeFrame = toggleFrames <= 0 ? 0 : Math.floor(frame / toggleFrames);
  const hasActiveSet = !!activeSrc || !!activeSrc2;
  let imageSrc = src;

  if (active && hasActiveSet) {
    if (activeSrc && activeSrc2) {
      imageSrc = activeFrame % 2 === 0 ? activeSrc : activeSrc2;
    } else if (activeSrc) {
      imageSrc = activeSrc;
    } else if (activeSrc2) {
      imageSrc = activeSrc2;
    }
  }

  const localFrame = activeInterval ? frame - activeInterval.start : 0;
  const speedScale = activeInterval?.speedScale ?? 1;
  const stretchCycleFrames = Math.max(
    1,
    Math.round((fps * 0.4) / speedScale),
  );
  const stretchPhase = (localFrame % stretchCycleFrames) / stretchCycleFrames;
  const stretchPulse = active
    ? 0.3 - 0.3 * Math.cos(stretchPhase * Math.PI * 2)
    : 0;
  const scaleY = 1 + stretchPulse * 0.05;
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
