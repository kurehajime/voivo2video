import {
  Composition,
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
  type CalculateMetadataFunction,
} from "remotion";
import { useEffect, useState } from "react";
import { Main } from "./MyComp/Main";
import {
  COMP_NAME,
  defaultMyCompProps,
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { NextLogo } from "./MyComp/NextLogo";
import { Stage as SubtitleStage } from "./Subtitles/Stage";
import { getTalkEndSeconds, type Vvproj } from "./Subtitles/vvproj";
import { CONFIG_LIST_JSON } from "./setting";

export const RemotionRoot: React.FC = () => {
  const fps = VIDEO_FPS;
  const [configList, setConfigList] = useState<
    Array<{ id?: string; configUrl: string }>
  >([]);
  const [handle] = useState(() => delayRender("load subtitle config list"));

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
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
    const configResponse = await fetch(staticFile(configUrl));
    if (!configResponse.ok) {
      throw new Error(`Failed to load config: ${configResponse.status}`);
    }
    const config = (await configResponse.json()) as { vvprojPath: string };
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
      <Composition
        id={COMP_NAME}
        component={Main}
        durationInFrames={DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={defaultMyCompProps}
      />
      <Composition
        id="NextLogo"
        component={NextLogo}
        durationInFrames={300}
        fps={30}
        width={140}
        height={140}
        defaultProps={{
          outProgress: 0,
        }}
      />
      {configList.map((entry) => {
        const configUrl = entry.configUrl;
        const id =
          entry.id ??
          configUrl
            .split("/")
            .filter(Boolean)
            .slice(-2, -1)[0] ??
          "vvproj-subtitles";

        return (
          <Composition
            key={id}
            id={`Subtitles-${id}`}
            component={SubtitleStage}
            durationInFrames={150}
            fps={fps}
            width={VIDEO_WIDTH}
            height={VIDEO_HEIGHT}
            defaultProps={{
              configUrl,
            }}
            calculateMetadata={calculateSubtitleMetadata}
          />
        );
      })}
    </>
  );
};
