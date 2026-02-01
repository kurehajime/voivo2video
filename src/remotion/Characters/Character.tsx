import { useCurrentFrame } from "remotion";

type Interval = {
  start: number;
  end: number;
  toggleFrames?: number;
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

  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width,
        height,
        transform: flipX ? "scaleX(-1)" : undefined,
        transformOrigin: "center",
      }}
    >
      <img
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
