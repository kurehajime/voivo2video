# VOICEVOX 手順と挙動差（vvproj の query 反映差）

VOICEVOX の操作手順によって、vvproj に保存される `audioItems[].query` の状態が変わり、
字幕タイミングの計算方法が変わることがある。

## 前提
- vvproj の `audioItems[].query` が時間計算の元になる
- `speedScale` は「話速」
- `prePhonemeLength` / `postPhonemeLength` は前後無音

## 観察された差
- `kana` が入っている vvproj と空の vvproj が混在する
- `speedScale` の適用範囲が `pre/post` に及んでいるかどうかで、
  字幕タイミングに差が出る

## 手順による挙動差（推察）
### 1) 速度変更のみ（話速を変える）
- `query.speedScale` の値は更新される
- モーラ長・無音長が再計算されないケースがある
- その結果、計算時に `speedScale` をどう扱うかでズレやすい

### 2) 前後無音の変更
- `prePhonemeLength` / `postPhonemeLength` は更新される
- `speedScale` の反映範囲が「合計」か「モーラのみ」かで一致条件が変わる

### 3) 読み（カナ）を明示入力
- `query.kana` に値が入るケースがある
- `kana` が埋まった時点でクエリ再生成が走る可能性がある

### 4) アクセント再生成
- クエリ（accentPhrases）が再生成される
- `query` 内の長さパラメータが更新される

## 実務的な対策
- `speedScale` の適用方式を config で切り替えられるようにする
  - `all`: 合計時間を割る
  - `phonemeOnly`: モーラ・ポーズのみ割る（pre/post は除外）
- 長編でズレる場合は WAV 長と照合し、誤差の小さい方式を選ぶ

## メモ
- `kana` の有無だけでは一致条件を説明できないケースがある
- vvproj 内に「クエリ再生成済みかどうか」のフラグは存在しない
