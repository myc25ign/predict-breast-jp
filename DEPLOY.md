# 本番デプロイ（Vercel + Git）

## リポジトリ構成

| ディレクトリ | 内容 |
|-------------|------|
| `ts/` | PREDICT コアエンジン（Phase 1–2） |
| `ui/` | React デモアプリ（Phase 3） |

## GitHub Pages（自動）

- リポジトリ: https://github.com/myc25ign/predict-breast-jp
- `master` への push で `.github/workflows/deploy-ui.yml` が `ui/` をビルドして公開
- 公開 URL: **https://myc25ign.github.io/predict-breast-jp/**（初回は Actions 完了後）

## Vercel（任意）

1. Vercel で GitHub リポジトリ `myc25ign/predict-breast-jp` を連携
2. **Root Directory**: `ui`
3. Framework Preset: Vite（`ui/vercel.json` 参照）
4. `master` への push で自動デプロイ（`base` は `/` のまま）

`vercel deploy` や CLI 直アップロードは使わず、**git push のみ**。

## ローカル確認

```bash
cd ui && npm ci && npm run build && npm run preview
```
