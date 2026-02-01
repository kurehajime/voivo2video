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
import { Character } from "../Characters/Character";

type StageProps = {
  configUrl?: string;
  mode?: "all" | "subtitles" | "character";
  characterId?: string;
};

type LineWithFrames = TalkLine & {
  startFrame: number;
  endFrame: number;
};

export const Stage: React.FC<StageProps> = ({
  configUrl,
  mode = "all",
  characterId,
}) => {
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
  const defaultTextColor = config?.textColor ?? "#0f172a";
  const defaultStrokeColor = config?.strokeColor ?? "rgba(0, 0, 0, 0.7)";
  const defaultStrokeWidth = config?.strokeWidth ?? 2;
  const defaultFontSize = config?.fontSize ?? 56;
  const defaultFontFamily =
    config?.fontFamily ?? "'Noto Sans JP', 'Hiragino Sans', sans-serif";
  const paddingBottom = config?.paddingBottom ?? 80;
  const activeMergeGapFrames = config?.activeMergeGapFrames ?? 0;

  const activeStyle = useMemo(() => {
    const speakerId = activeLine?.speakerId ?? null;
    const override = speakerId
      ? config?.speakers?.find((entry) => entry.speakerId === speakerId)
      : undefined;
    return {
      textColor: override?.textColor ?? defaultTextColor,
      strokeColor: override?.strokeColor ?? defaultStrokeColor,
      strokeWidth: override?.strokeWidth ?? defaultStrokeWidth,
      fontSize: override?.fontSize ?? defaultFontSize,
      fontFamily: override?.fontFamily ?? defaultFontFamily,
    };
  }, [
    activeLine?.speakerId,
    config?.speakers,
    defaultTextColor,
    defaultStrokeColor,
    defaultStrokeWidth,
    defaultFontSize,
    defaultFontFamily,
  ]);

  const activeIntervalsBySpeaker = useMemo(() => {
    const map = new Map<string, Array<{ start: number; end: number }>>();
    for (const line of lines) {
      if (!line.speakerId) {
        continue;
      }
      const list = map.get(line.speakerId) ?? [];
      list.push({ start: line.startFrame, end: line.endFrame });
      map.set(line.speakerId, list);
    }

    for (const [speakerId, intervals] of map.entries()) {
      const merged = intervals
        .sort((a, b) => a.start - b.start)
        .reduce<Array<{ start: number; end: number }>>((result, interval) => {
          const last = result[result.length - 1];
          if (!last) {
            result.push(interval);
            return result;
          }
          if (interval.start - last.end <= activeMergeGapFrames) {
            last.end = Math.max(last.end, interval.end);
          } else {
            result.push(interval);
          }
          return result;
        }, []);
      map.set(speakerId, merged);
    }

    return map;
  }, [activeMergeGapFrames, lines]);

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {config?.wavPath ? <Audio src={staticFile(config.wavPath)} /> : null}
      {mode !== "subtitles" &&
        (config?.characters ?? []).map((character) => {
          const id = character.id ?? character.speakerId;
          if (mode === "character" && characterId && id !== characterId) {
            return null;
          }
          const activeIntervals = activeIntervalsBySpeaker.get(
            character.speakerId,
          );
          return (
            <Character
              key={id}
              src={staticFile(character.imagePath)}
              activeSrc={
                character.activeImagePath
                  ? staticFile(character.activeImagePath)
                  : undefined
              }
              activeIntervals={activeIntervals}
              flipX={character.flipX}
              position={character.position}
              width={character.width}
              height={character.height}
            />
          );
        })}
      {mode !== "character" && activeLine ? (
        <div
          style={{
            position: "absolute",
            left: 80,
            right: 80,
            bottom: paddingBottom,
            color: activeStyle.textColor,
            fontSize: activeStyle.fontSize,
            fontFamily: activeStyle.fontFamily,
            lineHeight: 1.4,
            textAlign: "center",
            textShadow: "0 2px 12px rgba(0, 0, 0, 0.25)",
            whiteSpace: "pre-wrap",
            WebkitTextStroke: `${activeStyle.strokeWidth}px ${activeStyle.strokeColor}`,
            paintOrder: "stroke fill",
            overflowWrap: "anywhere",
            wordBreak: "normal",
            lineBreak: "strict",
          }}
        >
          {activeLine.text}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
