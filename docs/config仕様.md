# config仕様

字幕レンダリング用の設定ファイル仕様。

## 配置
- `public/config_list.json`
- `public/subtitles/config.json`

## config_list.json
字幕コンポジションの一覧。

例:
```json
[
  {
    "id": "test",
    "configUrl": "subtitles/config.json"
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
  "speakers": [
    {
      "speakerId": "388f246b-8c41-4ac1-8e2d-5d79f3ff56d9",
      "textColor": "#ffffff",
      "strokeColor": "#00cc33"
    },
    {
      "speakerId": "7ffcb7ce-00ec-4bdc-82cd-45a8889e43ff",
      "textColor": "#ffffff",
      "strokeColor": "#cc00cc"
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
- `speakers` (任意): 話者ごとの表示設定配列
  - `speakerId`: 話者ID
  - `textColor` (任意): 文字色
  - `strokeColor` (任意): 縁取り色



## 仕様メモ
- `configUrl` と各パスは `public/` からの相対パス
- 字幕の尺は vvproj の talk セリフから算出
