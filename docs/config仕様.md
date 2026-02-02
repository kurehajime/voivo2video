# config仕様

字幕レンダリング用の設定ファイル仕様。

## 配置
- `public/config_list.json`
- `public/subtitles/config.json`

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

## subtitles/config.json
字幕表示と vvproj 読み込みの設定。

例:
```json
{
  "vvprojPath": "subtitles/test.vvproj",
  "wavPath": "sound.wav",
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
      "imagePath": "images/zunda_normal.png",
      "activeImagePath": "images/zunda_active1.png",
      "activeImagePath2": "images/zunda_active2.png",
      "flipX": false,
      "activeToggleFrames": 6,
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
  - `imagePath`: 画像パス（通常状態）
  - `activeImagePath` (任意): 画像パス（発話状態）
  - `activeImagePath2` (任意): 画像パス（発話状態2）
  - `flipX` (任意): 左右反転（true で反転）
  - `activeToggleFrames` (任意): 発話中の切替間隔（フレーム）
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
  * imagePath, activeImagePath, activeImagePath2を差し替えてください
* 立ち絵の位置やサイズを変えたい
  * position, width, heightを調整してください
* 字幕のフォントや色を変えたい
  * textColor, strokeColor, strokeWidth, fontSize, fontFamilyを調整してください
