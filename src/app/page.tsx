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

const Home: NextPage = () => {
  const [durationInFrames, setDurationInFrames] = useState<number>(150);

  const inputProps = useMemo(() => {
    return {
      configUrl: "subtitles/config.json",
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadDuration = async () => {
      const configResponse = await fetch(`/${inputProps.configUrl}`);
      if (!configResponse.ok) {
        return;
      }
      const config = (await configResponse.json()) as { vvprojPath: string };
      const vvprojResponse = await fetch(`/${config.vvprojPath}`);
      if (!vvprojResponse.ok) {
        return;
      }
      const vvproj = (await vvprojResponse.json()) as Vvproj;
      if (cancelled) {
        return;
      }
      const seconds = getTalkEndSeconds(vvproj);
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
