# KIZANAMI

**兆しを読む、世界を知る。**

KIZANAMI（キザナミ）は、社会やテクノロジーの変化の兆しを、短く分かりやすく届けるニュースポータルを目指すプロジェクトです。名称は「兆し」と「波」を組み合わせた造語です。

初期MVPでは検証用のAIニュース記事を表示し、正式運用では**AIニュースを毎日3件**届けることを目指します。将来的には政治・AI政策・IT・経済・国際ニュースなどへの拡張を想定しています。

> **開発状況:** Astroのトップページ、記事詳細・日付別アーカイブを実装済みです。掲載記事はすべて架空サンプルです。実ニュースの自動取得・ChatGPT連携、およびGitHub Pagesへの公開はまだ実施されていません。

## サイト・リポジトリ

- リポジトリ: https://github.com/yuuzin217/kizanami
- 公開予定URL: https://yuuzin217.github.io/kizanami/ （**未公開**）
- 正式名称: **KIZANAMI**（キザナミ）
- ブランドコピー: **兆しを読む、世界を知る。**

## プロダクト方針

- 忙しい人でも重要ニュースを短時間で把握できる、簡潔な見出し・要約・「なぜ重要か」の説明
- 各ニュースに掲載日・出典リンクを付け、元情報へ容易に遷移できること
- 日付別のアーカイブを蓄積し、後から読み返せること
- 初期はAIカテゴリのみとし、カテゴリ追加時にUI・データ構造の大改修を要しないこと
- 原文・第三者の画像の無断転載を避け、出典を明確にすること

### デザイン

- **スタイル:** エディトリアル（新聞・雑誌）× 控えめな3D立体感
- **配色:** クリーム、テラコッタ、ダークブラウン
- **日本語見出し:** しっぽり明朝
- **日本語本文:** Zen角ゴシック
- **表現:** 余白・文字組み・紙面の重なり・自然な陰影を重視。過度なSF表現は避ける
- **要件:** レスポンシブ表示、可読性、アクセシビリティ、動きを抑えるOS設定への対応

デザインの原案は旧仮称「THE CURRENT」で試作したものです。採用したスタイルは引き継ぎ、表示上の名称とロゴをKIZANAMIに統一します。試作HTMLは現時点ではこのリポジトリに含まれていません。

## 技術構成（予定）

| 項目 | 方針 |
| --- | --- |
| フレームワーク | Astro + TypeScript |
| サイト生成 | 静的サイト生成（SSG） |
| ホスティング | GitHub Pages（サブパス `/kizanami/`） |
| CI/CD | GitHub Actions |
| 記事データ | JSONまたはMarkdown等の静的ファイル（`src/data/articles.json`、ビルド時検証） |
| DB / CMS | MVPでは導入しない |

## ローカル開発と検証

Node.js 22系を使用します。リポジトリ直下で実行してください。

```bash
npm ci
npm run dev
npm run check
npm run test
npm run build
npm run verify:site
```

GitHub Pages用の `/kizanami/` パスは設定済みです。**サイトはまだ公開していません**。公開操作は承認後に手動で行います。

## GitHub Pagesへの公開手順（手動・承認制）

公開予定URL: https://yuuzin217.github.io/kizanami/ （公開確認前はアクセスできると想定しない）

1. Issue #4と公開内容を確認し、公開について明示的な承認を得ます。現在の記事は**すべて架空サンプル**であり、全ページに検索エンジン向けの `noindex` を指定しています。公開後に実ニュースが自動更新されるわけではありません。
2. GitHubの **Settings → Pages → Build and deployment → Source** を `GitHub Actions` に設定します。デプロイ環境 `github-pages` の「Deployment branches」を `main` のみに制限することを推奨します。可能なプラン・設定であれば追加承認者（Required reviewers）も設定します。
3. **Actions → Publish KIZANAMI to GitHub Pages → Run workflow → Branch: main → Run workflow** を実行します。この操作はサイトを公開するため、承認前に実行しないでください。
4. ワークフロー内で `npm ci`、Astro check、Nodeテスト、静的ビルド、全ルート・リンク検証がPASSした後にだけPagesのartifactをアップロードし、デプロイします。
5. 実行後にワークフローのDeployment URLを確認し、トップ・記事詳細・日付別アーカイブ・CSS/フォント表示・スマホ表示・404を点検します。問題があれば作業を止め、影響範囲に応じて再デプロイまたはPagesの公開停止を判断します。

安全性：`.github/workflows/pages.yml` は **`workflow_dispatch` のみ**で起動し、pushやPRの作成・マージではデプロイしません。さらに `main` 以外ではbuild・deployジョブが実行されず、Pagesへの書き込み権限はdeployジョブに限定します。PR用の `UI checks` はテスト・ビルド・プレビュー成果物の生成だけを行い、サイトは公開しません。

GitHub Pages初回セットアップ時は、RepositoryのPages機能の利用可否・ワークフロー権限・環境保護設定を確認してください。権限や設定が不足している場合はデプロイできません。GitHub Actionsからの公開完了を確認するまでは「未公開」と扱います。

## CIとトラブルシューティング

- PRでは `UI checks` が `npm ci` / `npm run check` / `npm run test` / `npm run build` / `npm run verify:site` を実行し、プレビュー用成果物を作成します。
- CIが失敗した場合は、まずActionsの該当ジョブ・失敗したステップのログを確認します。記事データの不正値、重複slug、内部リンク、`/kizanami/` のbaseパスに注意してください。
- `npm ci` が失敗する場合は `package.json` とコミット済みの `package-lock.json` の一致を確認し、lockfileをその場で自動生成して問題を隠さないでください。
- GitHub Pagesでリソース404が起こる場合は、`astro.config.mjs` の `site`/`base`、生成HTML内のアセットパス、PagesのSource設定を確認してください。
- `noindex` の解除、公開コンテンツの実ニュースへの移行、毎日の自動デプロイは**このIssueの対象外**です。別途承認・検証が必要です。

## ニュース記事の追加・更新

1. [`src/data/articles.json`](./src/data/articles.json) に記事オブジェクトを追加します。既存のサンプルをひな形にします。
2. `id` と `slug` は全記事で一意にし、小文字英数字とハイフンを使います。記事URLは `/kizanami/news/<slug>/` です。
3. `category` は `src/data/newsModel.ts` の `categoryLabels` に定義済みのキー（初期は `ai`）を指定します。新ジャンルはその設定に表示名を追加します。
4. `curatedAt` は編集した日付（JST、`YYYY-MM-DD`）、`publishedAt` は原情報の公開日時（タイムゾーン付きISO 8601、例 `2026-10-29T07:00:00+09:00`）です。
5. `title`、`summary`、`whyItMatters`、`sourceName` は必須です。実際の記事は `isSample: false` とし、出典の**HTTPS URL**を `sourceUrl` に設定してください。架空記事は `isSample: true` と `sourceUrl: null` を使い、実在の出典と混同させません。
6. `npm run test && npm run check && npm run build && npm run verify:site` で検証します。不正データはビルド時にエラーとなります。トップページは最新編集日の記事から最大3件、アーカイブは編集日付順に表示されます。

記事原文・画像の利用条件を遵守し、事実確認・重複・出典URLを確認してください。ChatGPT定期タスクの自動連携はIssue #5で検証するまで未実装です。

## MVPとロードマップ

進行管理の正本は **[Issue #1 — MVP仕様・ロードマップ](https://github.com/yuuzin217/kizanami/issues/1)** です。

| 順序 | Issue | 内容 |
| --- | --- | --- |
| 1 | [#2 Astro基盤とデザイン](https://github.com/yuuzin217/kizanami/issues/2) | UI基盤、トップページ、タイポグラフィ、レスポンシブ対応 |
| 2 | [#3 記事データ・アーカイブ](https://github.com/yuuzin217/kizanami/issues/3) | 共通スキーマ、記事詳細、過去記事一覧 |
| 3 | [#4 CI / GitHub Pages](https://github.com/yuuzin217/kizanami/issues/4) | 検証と静的サイト公開の仕組み |
| 後続 | [#5 ニュース自動更新の検証](https://github.com/yuuzin217/kizanami/issues/5) | ChatGPT定期タスクとGitHubの連携可否・代替案の調査 |

MVPではサンプル記事を利用し、まずサイト表示と公開基盤を検証します。**既存のChatGPT定期タスクが配信するニュースをGitHubへ自動保存できるかどうかは未検証**です。できるものとして設計・報告せず、Issue #5で別途検証します。

## 開発・公開の運用

- 専用ブランチで変更し、Pull Requestでレビューする
- ローカル検証とCIを通したうえで、内容・影響範囲を確認する
- PRのマージ、サイトの公開・本番デプロイは明示的な承認のもとで進める
- ニュースの事実確認、一次ソースへのリンク、重複・誤情報の防止を重視する

## ライセンスとコンテンツの扱い

このリポジトリの独自のソフトウェアコードと付随する開発文書には [MIT License](./LICENSE) を採用しています。

今後追加する独自ニュース記事・画像などのコンテンツは、コードとは区別し、公開時にそれぞれの利用条件・権利表示を明示します。第三者が権利を持つ記事本文・写真・ロゴ・Webフォント等はMIT Licenseの許諾対象ではなく、各権利者の利用条件に従います。
