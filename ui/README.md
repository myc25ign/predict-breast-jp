# PREDICT Breast — デモ UI

ブラウザ完結型の乳がん予後予測デモ（プレゼン用）。

## 起動方法

```bash
cd ui
npm install
npm run dev
```

http://localhost:5173 で開きます。

## 構成

- **React + Vite** — フロントエンド
- **@predict** — `../ts/src` のコアエンジンを直接 import（APIサーバー不要）
- イギリス版 / 日本版エンジンをヘッダーのトグルで切り替え
- 下部に UK vs 日本の比較パネルを常時表示

## ビルド

```bash
npm run build
npm run preview
```
