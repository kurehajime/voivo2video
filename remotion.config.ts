// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { Config } from "@remotion/cli/config";
import { webpackOverride } from "./src/remotion/webpack-override.mjs";

// Studio のレンダー設定でも透過を保持できるようにする（ProRes 4444）
Config.setVideoImageFormat("png");
Config.setPixelFormat("yuva444p10le");
Config.setCodec("prores");
Config.setProResProfile("4444");
// 音声が無い場合はオーディオトラックを生成しない
Config.setEnforceAudioTrack(false);

Config.overrideWebpackConfig(webpackOverride);
