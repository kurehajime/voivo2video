"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next";
import { useEffect, useMemo, useState } from "react";
import {
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { Stage as SubtitleStage } from "../remotion/Subtitles/Stage";
import { getTalkEndSeconds, type Vvproj } from "../remotion/Subtitles/vvproj";
import type { SubtitleConfig } from "../remotion/Subtitles/config";
import { getAudioDuration } from "../lib/audio-duration";

const Home: NextPage = () => {
  const [durationInFrames, setDurationInFrames] = useState<number>(150);

  // 固定の configUrl でローカル確認する
  const inputProps = useMemo(() => {
    return {
      configUrl: "sample/config.json",
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadDuration = async () => {
      // vvproj のセリフ長を基準にプレイヤーの尺を決める
      const configResponse = await fetch(`/${inputProps.configUrl}`);
      if (!configResponse.ok) {
        return;
      }
      const config = (await configResponse.json()) as SubtitleConfig;
      if (config.wavPath) {
        const seconds = await getAudioDuration(`/${config.wavPath}`);
        if (cancelled) {
          return;
        }
        setDurationInFrames(Math.max(1, Math.ceil(seconds * VIDEO_FPS)));
        return;
      }
      const vvprojResponse = await fetch(`/${config.vvprojPath}`);
      if (!vvprojResponse.ok) {
        return;
      }
      const vvproj = (await vvprojResponse.json()) as Vvproj;
      if (cancelled) {
        return;
      }
      const speedScaleMode = config.speedScaleMode ?? "all";
      const seconds = getTalkEndSeconds(vvproj, speedScaleMode);
      setDurationInFrames(Math.max(1, Math.ceil(seconds * VIDEO_FPS)));
    };

    loadDuration();

    return () => {
      cancelled = true;
    };
  }, [inputProps.configUrl]);

  return (
    <div>
      <div className="max-w-screen-md m-auto mb-5">
        <div className="overflow-hidden rounded-geist shadow-[0_0_200px_rgba(0,0,0,0.15)] mb-10 mt-16">
          <Player
            component={SubtitleStage}
            inputProps={inputProps}
            durationInFrames={durationInFrames}
            fps={VIDEO_FPS}
            compositionHeight={VIDEO_HEIGHT}
            compositionWidth={VIDEO_WIDTH}
            style={{
              // Can't use tailwind class for width since player's default styles take presedence over tailwind's,
              // but not over inline styles
              width: "100%",
            }}
            controls
            autoPlay
            loop
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
