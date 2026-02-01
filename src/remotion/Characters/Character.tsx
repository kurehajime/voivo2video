import { useCurrentFrame } from "remotion";

type Interval = {
  start: number;
  end: number;
};

type CharacterProps = {
  src: string;
  activeSrc?: string;
  activeIntervals?: Interval[];
  position: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
};

const isActiveAtFrame = (frame: number, intervals?: Interval[]): boolean => {
  if (!intervals || intervals.length === 0) {
    return false;
  }
  for (const interval of intervals) {
    if (frame >= interval.start && frame < interval.end) {
      return true;
    }
  }
  return false;
};

export const Character: React.FC<CharacterProps> = ({
  src,
  activeSrc,
  activeIntervals,
  position,
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const active = isActiveAtFrame(frame, activeIntervals);
  const imageSrc = active && activeSrc ? activeSrc : src;

  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width,
        height,
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
