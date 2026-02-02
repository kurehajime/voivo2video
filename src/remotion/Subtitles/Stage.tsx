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
  activeStartFrame: number;
  activeEndFrame: number;
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
  const [subtitleCss, setSubtitleCss] = useState<string | null>(null);
  const [handle] = useState(() => delayRender("load subtitle config"));

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        if (!configUrl) {
          throw new Error("configUrl is required");
        }
        // Remotion の staticFile は public 配下の相対パスを解決する
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

  useEffect(() => {
    let cancelled = false;

    const loadCss = async () => {
      const cssPath = config?.cssPath;
      if (!cssPath) {
        setSubtitleCss(null);
        return;
      }
      const response = await fetch(staticFile(cssPath));
      if (!response.ok) {
        return;
      }
      const cssText = await response.text();
      if (!cancelled) {
        setSubtitleCss(cssText);
      }
    };

    loadCss();

    return () => {
      cancelled = true;
    };
  }, [config?.cssPath]);

  const lines = useMemo<LineWithFrames[]>(() => {
    if (!vvproj) {
      return [];
    }

    return getTalkLines(vvproj)
      .filter((line) => line.text.trim().length > 0)
      .map((line) => {
        // セリフ全体の表示区間（字幕用）
        const startFrame = Math.max(0, Math.floor(line.startSec * fps));
        const endFrame = Math.max(startFrame + 1, Math.ceil(line.endSec * fps));
        // 口パク用のアクティブ区間（前後無音を除外）
        const activeStartSec = Math.min(
          line.endSec,
          line.startSec + line.prePhonemeLength,
        );
        const activeEndSec = Math.max(
          line.startSec,
          line.endSec - line.postPhonemeLength,
        );
        const activeStartFrame = Math.max(
          0,
          Math.floor(activeStartSec * fps),
        );
        const activeEndFrame = Math.max(
          activeStartFrame + 1,
          Math.ceil(activeEndSec * fps),
        );
        return {
          ...line,
          startFrame,
          endFrame,
          activeStartFrame,
          activeEndFrame,
        };
      });
  }, [fps, vvproj]);

  const activeLine = useMemo(() => {
    // 現在フレームに対応するセリフを取得
    for (const line of lines) {
      if (frame >= line.startFrame && frame < line.endFrame) {
        return line;
      }
    }
    return null;
  }, [frame, lines]);

  const backgroundColor = "transparent";
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
      ? config?.characters?.find((entry) => entry.speakerId === speakerId)
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
    config?.characters,
    defaultTextColor,
    defaultStrokeColor,
    defaultStrokeWidth,
    defaultFontSize,
    defaultFontFamily,
  ]);

  const activeIntervalsBySpeaker = useMemo(() => {
    const map = new Map<
      string,
      Array<{
        start: number;
        end: number;
        speedScale?: number;
      }>
    >();
    for (const line of lines) {
      if (!line.speakerId) {
        continue;
      }
      const list = map.get(line.speakerId) ?? [];
      const speedScale = line.speedScale > 0 ? line.speedScale : 1;
      list.push({
        start: line.activeStartFrame,
        end: line.activeEndFrame,
        speedScale,
      });
      map.set(line.speakerId, list);
    }

    for (const [speakerId, intervals] of map.entries()) {
      // 近接した区間を結合して、口パクのブツ切れを減らす
      const merged = intervals
        .sort((a, b) => a.start - b.start)
        .reduce<
          Array<{
            start: number;
            end: number;
            speedScale?: number;
          }>
        >((result, interval) => {
          const last = result[result.length - 1];
          if (!last) {
            result.push(interval);
            return result;
          }
          if (interval.start - last.end <= activeMergeGapFrames) {
            last.end = Math.max(last.end, interval.end);
            last.speedScale = interval.speedScale ?? last.speedScale;
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
      {config?.wavPath ? (
        mode === "all" ? (
          <Audio src={staticFile(config.wavPath)} />
        ) : (
          // 非 All は無音トラックを明示的に作り、ノイズ混入を防ぐ
          <Audio src={staticFile(config.wavPath)} volume={0} />
        )
      ) : null}
      {subtitleCss ? <style>{subtitleCss}</style> : null}
      {/* 立ち絵は字幕のみ出力のときは非表示 */}
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
              normalImages={character.normalImages.map((path) => staticFile(path))}
              activeImages={
                character.activeImages?.map((path) => staticFile(path))
              }
              normalFrames={character.normalFrames}
              activeFrames={character.activeFrames}
              activeIntervals={activeIntervals}
              flipX={character.flipX}
              position={character.position}
              width={character.width}
              height={character.height}
            />
          );
        })}
      {/* 立ち絵のみ出力のときは字幕を非表示 */}
      {mode !== "character" && activeLine ? (
        <div
          id="subtitle"
          style={{
            position: "absolute",
            left: 80,
            right: 80,
            bottom: paddingBottom,
            color: activeStyle.textColor,
            fontSize: activeStyle.fontSize,
            // CSS 側でフォント指定したい場合は上書きできるようにする
            fontFamily: config?.cssPath ? undefined : activeStyle.fontFamily,
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
