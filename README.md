# voivo2video

VOICEVOXのプロジェクトファイル(*.vvproj)から字幕と立ち絵動画を作るツールです。

## セットアップ

```sh
npm install
```

## サンプルの確認方法

以下のコマンドを叩くとRemotion StudioのWeb UIが立ち上がります。

```sh
npm run studio
```

Studio には以下の Composition が出ます。

- `All-<id>`: 立ち絵 + 字幕 + 音声を合成した動画
- `Subtitles-<id>`: 字幕のみの動画(背景透過)
- `Character-<id>-<characterId>`: 立ち絵のみ（キャラ単体）の動画(背景透過)

Renderボタンを押すと動画を出力します。

## 設定ファイル

設定ファイルを修正したり置き換えたりすることで、自分のVOICEVOXプロジェクトから動画を作成できます。
立ち絵画像や文字のスタイルも設定可能です。

- `public/config_list.json`
  - 表示する config 一覧
- `public/[プロジェクト]/config.json`
  - vvproj / 音声 / 字幕 / 立ち絵の設定
   - [詳細はこちら](docs/config仕様.md)
- `public/[プロジェクト]/*.vvproj`
  - VOICEVOX プロジェクトファイル
- `public/[プロジェクト]/*.wav`
  - 音声ファイル
- `public/[プロジェクト]/*.css`
  - 字幕のスタイル
- `public/images/*.png`
  - 立ち絵画像

### CSS で字幕をカスタム

`public/sample/config.json` の `cssPath` を指定すると、
`public/sample/sample.css` の `#subtitle` が字幕に適用されます。

### ローカルフォントを安定適用する

`public/sample/config.json` の `localFonts` にフォントを登録すると、
レンダー開始前にフォントを先読みして先頭フレームの未適用を防げます。

### speakerId 一覧

`docs/speakerId一覧.md` を参照してください。


## コマンドによる出力
以下のコマンドで `public/out` に動画が出力されます。

```sh
npm run render
```

## サンプル画像について
サンプル画像は[坂本アヒルさんの立ち絵素材](https://www.pixiv.net/artworks/92641351)と差し替えて使う想定で、同じ解像度にしています。

サンプル画像そのままでの利用もできます。[東北ずん子ずんだもんプロジェクトキャラクター利用の手引き](https://zunko.jp/guideline.html
)に反しない範囲でご自由にお使いください。
（ず・ω・きょ）
