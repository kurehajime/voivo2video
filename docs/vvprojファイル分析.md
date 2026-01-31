# vvprojファイル分析（高速な発話時間算出）

## 目的
VOICEVOX のプロジェクトファイル（.vvproj）に含まれる `talk.audioItems[].query` を解析し、
WAV を生成せずに各セリフの発話時間を高速に算出するための指針をまとめる。

## 前提
- `.vvproj` は JSON 形式
- `talk.audioItems` はセリフ単位の音声合成情報を持つ
- `talk.audioKeys` がセリフ順序を保持する

## 重要ポイント
### 1) セリフ順序
`audioItems` は UUID をキーにした辞書なので、
列挙順に頼らず `audioKeys` の順で処理する。

### 2) 高速算出で得られる時間
`query` 内のモーラ長・休止・前後無音を合算することで、
「エンジンが設計上想定する発話時間（秒）」を算出できる。

これは実際の WAV サンプル長と完全一致する保証はないが、
字幕・口パク・タイムラインの初期値として十分に実用的。

## 算出式（秒）
以下を合算する。

```
発話時間 = prePhonemeLength
        + Σ(アクセント句)
            + Σ(各 mora の consonantLength + vowelLength)
            + (pauseMora があればその vowelLength)
        + postPhonemeLength
```

### 補足
- `consonantLength` が無い mora は 0 として扱う
- `pauseMora` はアクセント句の後ろに入る休止
- `speedScale` などは query 生成時点で反映済みの前提

## 具体的な手順
1. `.vvproj` を JSON として読み込む
2. `talk.audioKeys` の順で `audioItems[key]` を取得
3. `audioItem.query` から上記の式で秒数を計算
4. 累積して開始秒（start）も算出

## 正確性について
- この方法は .vvproj だけで完結する高速な近似
- 最終 WAV の再生時間（サンプル精度）と完全一致は保証されない
- 厳密一致が必要な場合は、同一エンジンで再合成して WAV のサンプル数を測定する

---

必要なら TypeScript 版のサンプルや、SRT 生成までの拡張手順も追加できる。
