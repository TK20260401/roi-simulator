# ROI Simulator — 収益計画シミュレーション・KGI/KPI管理

## 目的

AIエージェントシステムのROI・投資回収期間・年間効果額を営業がその場で即時可視化し、クライアントへの提案力を最大化するWebアプリケーション。

## 本番URL

https://roi-simulator-delta.vercel.app

## ログイン

- ユーザーID: `admin`
- パスワード: `20260406`

## 主要な機能

| 機能 | 概要 |
| --- | --- |
| シミュレーション | 現状コスト7項目+AI導入2項目+削減見込み3項目→即時ROI計算・グラフ表示 |
| 折れ線グラフ | 累積コスト削減額 vs 累積投資額（回収ポイント表示） |
| 棒グラフ | 月次ビフォーアフター比較（導入前 vs 導入後） |
| シミュレーション保存 | 名前をつけて保存・一覧・詳細表示 |
| KGI/KPI管理 | 最終目標（KGI）と中間指標（KPI）の階層管理・CRUD |
| ダッシュボード | シミュレーション数・今月の作成数・KGI目標数・最近のシミュレーション |
| レスポンシブ | PC/タブレット/スマホ対応 |

## セキュリティ

| 対策 | 内容 |
| --- | --- |
| RLS | anon keyでの直接アクセス完全遮断（SELECT/INSERT/UPDATE/DELETE全て拒否） |
| APIルート | 全DB操作はサーバーAPIルート経由（cookie認証チェック付き） |
| SECURITY DEFINER | DB操作はpostgres関数経由（RLSバイパスはサーバー側のみ） |
| 個人情報 | メールアドレスはDB・UIともに非公開（表示名のみ） |

## 技術スタック

| レイヤー | 技術 |
| --- | --- |
| フロントエンド | Next.js 16 (App Router) + TypeScript |
| スタイリング | Tailwind CSS |
| グラフ | Recharts |
| バックエンド/DB | Supabase (PostgreSQL + RLS) |
| デプロイ | Vercel |

## 開発

```bash
npm install
npm run dev
```

http://localhost:3000 を開いて確認。

## ファイル構成

```
src/
├── app/
│   ├── api/
│   │   ├── auth/route.ts          # ベーシック認証API
│   │   ├── dashboard/route.ts     # ダッシュボードデータAPI
│   │   ├── simulations/route.ts   # シミュレーションCRUD API
│   │   ├── kgi/route.ts           # KGI CRUD API
│   │   └── kpi/route.ts           # KPI CRUD API
│   ├── dashboard/page.tsx         # ダッシュボード
│   ├── simulations/
│   │   ├── new/page.tsx           # シミュレーション作成（メイン画面）
│   │   └── [id]/page.tsx          # 保存済み詳細表示
│   ├── history/page.tsx           # シミュレーション履歴
│   ├── kpi/page.tsx               # KGI/KPI管理
│   ├── login/page.tsx             # ログイン
│   └── layout.tsx
├── components/
│   ├── sidebar.tsx                # サイドバーナビ
│   └── app-shell.tsx              # レイアウトシェル
├── lib/
│   ├── calc.ts                    # 計算ロジック（独立関数）
│   └── supabase/
│       ├── client.ts
│       └── server.ts              # サーバー用（APIルートで使用）
└── proxy.ts                       # 認証チェック・リダイレクト
```
