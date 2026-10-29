/**
 * Design-only placeholders. Never present as published reporting.
 * Issue #3 will replace this with a validated news content model.
 */
export interface SampleNews {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  description: string;
}

export const sampleNews: readonly SampleNews[] = [
  {
    id: '01',
    category: 'AI / AGENTS',
    title: 'AIエージェントの実運用が、次の競争領域へ',
    excerpt: 'PoCの次は信頼性と運用性。企業でAIを使い続けるための視点。',
    description:
      '企業のAIエージェント活用において、単発のデモから業務全体の信頼性、監査可能性、運用コストが重要になる、という設定のサンプル記事です。実在するニュースの要約ではありません。',
  },
  {
    id: '02',
    category: 'AI / MODEL EVALUATION',
    title: '生成AIの品質評価、何を基準に比較する？',
    excerpt: '見かけのスコアを超えて、実環境でモデルの価値を測る。',
    description:
      '複数モデルやサービスを比較する際、安全性・再現性・実環境における使いやすさも組み合わせて評価する、という例示用の架空の記事です。',
  },
  {
    id: '03',
    category: 'AI / ENGINEERING',
    title: 'AI開発のコストを見直す、設計の新しい常識',
    excerpt: '品質を守りながらコストを抑える、AIシステム設計の工夫。',
    description:
      '推論コストと体験品質を両立するための小規模モデル活用やキャッシュ、ルーティング設計を考えるという設定のサンプル記事です。実際のニュースではありません。',
  },
];
