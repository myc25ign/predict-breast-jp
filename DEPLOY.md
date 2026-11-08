# 本番デプロイ（Vercel + Git）

## リポジトリ構成

| ディレクトリ | 内容 |
|-------------|------|
| `ts/` | PREDICT コアエンジン（Phase 1–2） |
| `ui/` | React デモアプリ（Phase 3） |

## Vercel 設定

1. Vercel で Git 連携リポジトリを接続
2. **Root Directory**: `ui`
3. Framework Preset: Vite（`ui/vercel.json` 参照）
4. `main` / `master` への push で自動デプロイ

`vercel deploy` や CLI 直アップロードは使わず、**git push のみ**。

## ローカル確認

```bash
cd ui && npm ci && npm run build && npm run preview
```
