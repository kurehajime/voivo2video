# config仕様

字幕レンダリング用の設定ファイル仕様。

## 配置
- `public/config_list.json`
- `public/sample/config.json`

## config_list.json
字幕コンポジションの一覧。
設定ファイルを複数用意して管理することができます。

例:
```json
[
  {
    "id": "test",
    "configUrl": "sample/config.json"
  }
]
```

- `id`: コンポジション識別子（任意）
- `configUrl`: `public/` 配下の設定ファイルへの相対パス

## sample/config.json
字幕表示と vvproj 読み込みの設定。

例:
```json
{
  "vvprojPath": "sample/sample.vvproj",
  "wavPath": "sound.wav",
  "localFonts": [
    {
      "family": "Yusei Magic",
      "path": "fonts/YuseiMagic-Regular.ttf",
      "weight": 400,
      "style": "normal"
    }
  ],
  "backgroundColor": "#f7f6f2",
  "textColor": "#0f172a",
  "strokeColor": "#0b1020",
  "strokeWidth": 2,
  "fontSize": 56,
  "fontFamily": "'Noto Sans JP', 'Hiragino Sans', sans-serif",
  "paddingBottom": 80,
  "activeMergeGapFrames": 2,
  "cssPath": "sample/sample.css",
  "characters": [
    {
      "id": "zunda",
      "speakerId": "388f246b-8c41-4ac1-8e2d-5d79f3ff56d9",
      "normalImages": ["images/zunda_normal.png"],
      "activeImages": ["images/zunda_active1.png", "images/zunda_active2.png"],
      "normalFrames": [20],
      "activeFrames": [8, 8],
      "flipX": false,
      "textColor": "#ffffff",
      "strokeColor": "#00cc33",
      "position": {
        "x": 80,
        "y": 200
      },
      "width": 640,
      "height": 720
    }
  ]
}
```

### フィールド
- `vvprojPath` (必須): `public/` 配下の vvproj への相対パス
- `wavPath` (任意): `public/` 配下の wav への相対パス。指定すると音声を再生
- `backgroundColor` (任意): 背景色
- `localFonts` (任意): レンダー前に先読みするローカルフォント設定
  - `family`: CSS で使うフォント名
  - `path`: `public/` 配下のフォントファイル相対パス
  - `weight` (任意): フォントウェイト
  - `style` (任意): `normal` / `italic`
- `textColor` (任意): 文字色
- `strokeColor` (任意): 縁取り色（WebkitTextStroke）
- `strokeWidth` (任意): 縁取りの太さ（px）
- `fontSize` (任意): フォントサイズ
- `fontFamily` (任意): フォントファミリー
- `paddingBottom` (任意): 画面下からの余白（px）
- `activeMergeGapFrames` (任意): 発話区間の結合しきい値（フレーム）
- `cssPath` (任意): 字幕用のCSSファイルのパス（public 配下の相対パス）
- `characters` (任意): 立ち絵の表示設定配列
  - `id` (任意): キャラ識別子（省略時は speakerId を使用）
  - `speakerId`: 話者ID [どのキャラ](./speakerId一覧.md)の音声を使用するか
  - `normalImages`: 通常時にループする画像パス配列
  - `activeImages` (任意): 発話時にループする画像パス配列
  - `normalFrames` (任意): `normalImages` の各画像表示フレーム数配列
  - `activeFrames` (任意): `activeImages` の各画像表示フレーム数配列
  - `flipX` (任意): 左右反転（true で反転）
  - `textColor` (任意): 文字色
  - `strokeColor` (任意): 縁取り色
  - `strokeWidth` (任意): 縁取りの太さ（px）
  - `fontSize` (任意): フォントサイズ
  - `fontFamily` (任意): フォントファミリー
  - `position`: 配置座標
  - `width`: 幅
  - `height`: 高さ

### 結局どれをいじればいいの？

* キャラを差し替えたい、追加したい
  * speakerIdを[キャラ一覧](./speakerId一覧.md)をもとに差し替えてください
  * 新しいキャラを追加する場合はcharacters配列にオブジェクトを追加してください
* 立ち絵画像を差し替えたい
  * normalImages, activeImagesを差し替えてください
* 立ち絵の切り替え速度を変えたい
  * normalFrames, activeFramesを調整してください
* 立ち絵の位置やサイズを変えたい
  * position, width, heightを調整してください
* 字幕のフォントや色を変えたい
  * textColor, strokeColor, strokeWidth, fontSize, fontFamilyを調整してください
* 字幕フォントの初期フレーム崩れを防ぎたい
  * localFonts にフォントを登録し、cssPath 側では `#subtitle { font-family: ... }` を指定してください
