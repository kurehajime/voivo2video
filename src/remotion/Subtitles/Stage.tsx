import {
  AbsoluteFill,
  Audio,
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useEffect, useMemo, useState } from "react";
import type { SubtitleConfig } from "./config";
import { getTalkLines, type TalkLine, type Vvproj } from "./vvproj";

type StageProps = {
  configUrl?: string;
};

type LineWithFrames = TalkLine & {
  startFrame: number;
  endFrame: number;
};

export const Stage: React.FC<StageProps> = ({ configUrl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [config, setConfig] = useState<SubtitleConfig | null>(null);
  const [vvproj, setVvproj] = useState<Vvproj | null>(null);
  const [handle] = useState(() => delayRender("load subtitle config"));

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        if (!configUrl) {
          throw new Error("configUrl is required");
        }
        const configResponse = await fetch(staticFile(configUrl));
        if (!configResponse.ok) {
          throw new Error(`Failed to load config: ${configResponse.status}`);
        }
        const configJson = (await configResponse.json()) as SubtitleConfig;
        if (cancelled) {
          return;
        }
        setConfig(configJson);

        const vvprojResponse = await fetch(staticFile(configJson.vvprojPath));
        if (!vvprojResponse.ok) {
          throw new Error(`Failed to load vvproj: ${vvprojResponse.status}`);
        }
        const vvprojJson = (await vvprojResponse.json()) as Vvproj;
        if (cancelled) {
          return;
        }
        setVvproj(vvprojJson);
      } catch (error) {
        cancelRender(error);
      } finally {
        if (!cancelled) {
          continueRender(handle);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [configUrl, handle]);

  const lines = useMemo<LineWithFrames[]>(() => {
    if (!vvproj) {
      return [];
    }

    return getTalkLines(vvproj)
      .filter((line) => line.text.trim().length > 0)
      .map((line) => {
        const startFrame = Math.max(0, Math.floor(line.startSec * fps));
        const endFrame = Math.max(startFrame + 1, Math.ceil(line.endSec * fps));
        return {
          ...line,
          startFrame,
          endFrame,
        };
      });
  }, [fps, vvproj]);

  const activeLine = useMemo(() => {
    for (const line of lines) {
      if (frame >= line.startFrame && frame < line.endFrame) {
        return line;
      }
    }
    return null;
  }, [frame, lines]);

  const backgroundColor = config?.backgroundColor ?? "#f7f6f2";
  const textColor = config?.textColor ?? "#0f172a";
  const strokeColor = config?.strokeColor ?? "rgba(0, 0, 0, 0.7)";
  const strokeWidth = config?.strokeWidth ?? 2;
  const fontSize = config?.fontSize ?? 56;
  const fontFamily =
    config?.fontFamily ?? "'Noto Sans JP', 'Hiragino Sans', sans-serif";
  const paddingBottom = config?.paddingBottom ?? 80;

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {config?.wavPath ? <Audio src={staticFile(config.wavPath)} /> : null}
      {activeLine ? (
        <div
          style={{
            position: "absolute",
            left: 80,
            right: 80,
            bottom: paddingBottom,
            color: textColor,
            fontSize,
            fontFamily,
            lineHeight: 1.4,
            textAlign: "center",
            textShadow: "0 2px 12px rgba(0, 0, 0, 0.25)",
            whiteSpace: "pre-wrap",
            WebkitTextStroke: `${strokeWidth}px ${strokeColor}`,
            paintOrder: "stroke fill",
          }}
        >
          {activeLine.text}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
