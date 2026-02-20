import {
  Composition,
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
  type CalculateMetadataFunction,
} from "remotion";
import { useEffect, useState } from "react";
import {
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { Stage as SubtitleStage } from "./Subtitles/Stage";
import { getTalkEndSeconds, type Vvproj } from "./Subtitles/vvproj";
import type { SubtitleConfig } from "./Subtitles/config";
import { CONFIG_LIST_JSON } from "./setting";
import { getAudioDuration } from "../lib/audio-duration";

export const RemotionRoot: React.FC = () => {
  const fps = VIDEO_FPS;
  const [configList, setConfigList] = useState<
    Array<{ id?: string; configUrl: string }>
  >([]);
  const [configMap, setConfigMap] = useState<
    Record<string, SubtitleConfig | undefined>
  >({});
  const [handle] = useState(() =>
    delayRender("load subtitle config list"),
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        // config_list.json から字幕設定一覧を読み込む
        const response = await fetch(staticFile(CONFIG_LIST_JSON));
        if (!response.ok) {
          throw new Error(
            `Failed to load subtitle config list: ${response.status}`,
          );
        }
        const list = (await response.json()) as Array<{
          id?: string;
          configUrl: string;
        }>;
        if (cancelled) {
          return;
        }
        setConfigList(list);
        // 各 config を先読みしてキャラクター出力用の Composition を作る
        const configs = await Promise.all(
          list.map(async (entry) => {
            const configResponse = await fetch(staticFile(entry.configUrl));
            if (!configResponse.ok) {
              return [entry.configUrl, undefined] as const;
            }
            const configJson =
              (await configResponse.json()) as SubtitleConfig;
            return [entry.configUrl, configJson] as const;
          }),
        );
        if (cancelled) {
          return;
        }
        setConfigMap(Object.fromEntries(configs));
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
  }, [handle]);

  const calculateSubtitleMetadata: CalculateMetadataFunction<
    React.ComponentProps<typeof SubtitleStage>
  > = async ({ props }) => {
    const configUrl = props.configUrl;
    if (!configUrl) {
      throw new Error("configUrl is required");
    }
    // vvproj を読み込み、セリフ長から尺を決定する
    const configResponse = await fetch(staticFile(configUrl));
    if (!configResponse.ok) {
      throw new Error(`Failed to load config: ${configResponse.status}`);
    }
    const config = (await configResponse.json()) as SubtitleConfig;
    if (config.wavPath) {
      const durationInSeconds = await getAudioDuration(
        staticFile(config.wavPath),
      );
      const durationInFrames = Math.max(
        1,
        Math.ceil(durationInSeconds * fps),
      );
      return {
        durationInFrames,
        props,
      };
    }
    const vvprojResponse = await fetch(staticFile(config.vvprojPath));
    if (!vvprojResponse.ok) {
      throw new Error(`Failed to load vvproj: ${vvprojResponse.status}`);
    }
    const vvproj = (await vvprojResponse.json()) as Vvproj;
    const durationInFrames = Math.max(
      1,
      Math.ceil(getTalkEndSeconds(vvproj) * fps),
    );

    return {
      durationInFrames,
      props,
    };
  };

  return (
    <>
      {configList.map((entry) => {
        const configUrl = entry.configUrl;
        const id =
          entry.id ??
          configUrl
            .split("/")
            .filter(Boolean)
            .slice(-2, -1)[0] ??
          "vvproj-subtitles";
        const config = configMap[configUrl];

        // 1つの config から All/Subtitles/Character の各出力を作る
        const compositions = [
          <Composition
            key={`All-${id}`}
            id={`All-${id}`}
            component={SubtitleStage}
            durationInFrames={150}
            fps={fps}
            width={VIDEO_WIDTH}
            height={VIDEO_HEIGHT}
            defaultProps={{
              configUrl,
              mode: "all",
            }}
            calculateMetadata={calculateSubtitleMetadata}
          />,
          <Composition
            key={`Subtitles-${id}`}
            id={`Subtitles-${id}`}
            component={SubtitleStage}
            durationInFrames={150}
            fps={fps}
            width={VIDEO_WIDTH}
            height={VIDEO_HEIGHT}
            defaultProps={{
              configUrl,
              mode: "subtitles",
            }}
            calculateMetadata={calculateSubtitleMetadata}
          />,
        ];

        for (const character of config?.characters ?? []) {
          const characterKey = character.id ?? character.speakerId;
          compositions.push(
            <Composition
              key={`Character-${id}-${characterKey}`}
              id={`Character-${id}-${characterKey}`}
              component={SubtitleStage}
              durationInFrames={150}
              fps={fps}
              width={VIDEO_WIDTH}
              height={VIDEO_HEIGHT}
              defaultProps={{
                configUrl,
                mode: "character",
                characterId: characterKey,
              }}
              calculateMetadata={calculateSubtitleMetadata}
            />,
          );
        }

        return compositions;
      })}
    </>
  );
};
