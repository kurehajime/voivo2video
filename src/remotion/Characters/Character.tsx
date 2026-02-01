import { Img, useCurrentFrame, useVideoConfig } from "remotion";

// 発話中のアクティブ区間と口パク速度の情報
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
  // 口パク切替の間隔（話速が速いほど短くなる）
  const toggleFrames = activeInterval?.toggleFrames ?? activeToggleFrames ?? 6;
  const activeFrame = toggleFrames <= 0 ? 0 : Math.floor(frame / toggleFrames);
  const hasActiveSet = !!activeSrc || !!activeSrc2;
  let imageSrc = src;

  // アクティブ中は2枚の画像を交互に切り替える
  if (active && hasActiveSet) {
    if (activeSrc && activeSrc2) {
      imageSrc = activeFrame % 2 === 0 ? activeSrc : activeSrc2;
    } else if (activeSrc) {
      imageSrc = activeSrc;
    } else if (activeSrc2) {
      imageSrc = activeSrc2;
    }
  }

  // 発話中は縦方向にわずかに伸縮させる（口パクの勢い付け）
  const localFrame = activeInterval ? frame - activeInterval.start : 0;
  const speedScale = activeInterval?.speedScale ?? 1;
  // 0.4秒サイクルを基準にし、話速で周期を変える
  const stretchCycleFrames = Math.max(
    1,
    Math.round((fps * 0.4) / speedScale),
  );
  const stretchPhase = (localFrame % stretchCycleFrames) / stretchCycleFrames;
  // cos 波で 0→1→0 を作り、滑らかな伸縮にする
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
