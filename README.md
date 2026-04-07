# ROI Simulator — 収益計画シミュレーション・KGI/KPI管理（v2）

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
| シミュレーション | 現状コスト8項目+AI導入3項目+削減見込み3項目→即時ROI計算・グラフ表示 |
| 折れ線グラフ | 累積コスト削減額 vs 累積投資額（回収ポイント表示） |
| 棒グラフ | 月次ビフォーアフター比較（導入前 vs 導入後） |
| シミュレーション保存 | 名前をつけて保存・一覧・詳細表示 |
| 業界別プリセット | 7テンプレート（コールセンター/製造/小売/金融/自治体）からワンクリック入力 |
| 比較機能 | 最大4つのシミュレーションを横並び比較（テーブル+グラフ） |
| 印刷/PDF出力 | 作成画面・詳細画面の両方から印刷/PDF保存（A4横、グラフ+コスト内訳+前提条件、Confidential付き） |
| KGI/KPI管理 | 最終目標（KGI）と中間指標（KPI）の階層管理・CRUD |
| ヘルプ | クイックスタート3ステップ + FAQ 14項目 + 全入力項目にツールチップ |
| AIチャット | フローティングチャットアシスタント（Claude API連携、APIキー設定後有効） |
| ダッシュボード | シミュレーション数・今月の作成数・KGI目標数・最近のシミュレーション |
| レスポンシブ | PC/タブレット/スマホ対応 |

## バージョン履歴

| Version | Date | Changes |
| --- | --- | --- |
| v1 | 2026-04-06 | 初期構築。即時ROI計算+Rechartsグラフ、KGI/KPI管理、ベーシック認証、RLS完全遮断+SECURITY DEFINER、全DB操作API経由、ヘルプ+ツールチップ、AIチャット、印刷/PDF出力、業界別プリセット7種、比較機能（最大4プラン）、レスポンシブ対応 |
| v2 | 2026-04-07 | オペレーター人数×人月コスト自動算出連携、「月間コール件数」→「月間対応件数」ラベル汎用化（全チャネル対応）、API従量課金費用（monthlyApiCost）入力欄追加、コスト内訳にAPI費用行追加、全プリセット・保存・読込・比較画面を一貫更新、DBマイグレーション（operator_count/monthly_api_cost カラム追加） |

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
│   │   ├── kpi/route.ts           # KPI CRUD API
│   │   └── chat/route.ts          # AIチャットAPI（Claude連携）
│   ├── dashboard/page.tsx         # ダッシュボード
│   ├── simulations/
│   │   ├── new/page.tsx           # シミュレーション作成（メイン画面・印刷/PDF対応）
│   │   └── [id]/page.tsx          # 保存済み詳細表示・印刷/PDF対応
│   ├── compare/page.tsx           # シミュレーション比較（最大4プラン）
│   ├── history/page.tsx           # シミュレーション履歴
│   ├── kpi/page.tsx               # KGI/KPI管理
│   ├── help/page.tsx              # ヘルプ・FAQ
│   ├── login/page.tsx             # ログイン
│   └── layout.tsx
├── components/
│   ├── sidebar.tsx                # サイドバーナビ
│   ├── app-shell.tsx              # レイアウトシェル
│   ├── chat-widget.tsx            # AIチャットウィジェット
│   └── tooltip.tsx                # ツールチップ
├── lib/
│   ├── calc.ts                    # 計算ロジック（独立関数）
│   └── supabase/
│       ├── client.ts
│       └── server.ts              # サーバー用（APIルートで使用）
├── proxy.ts                       # 認証チェック・リダイレクト
docs/
├── wireframe.html                 # ワイヤーフレーム（表側/裏側ビジュアライゼーション）
├── mockup.html                    # インタラクティブモックアップ（全画面切替・表裏分割表示）
└── migration-operator-count-api-cost.sql  # v2 DBマイグレーション
```
