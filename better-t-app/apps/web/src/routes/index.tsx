import { Button } from "@better-t-app/ui/components/button";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BookOpen, Star, Wine } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const CATEGORIES = [
  { slug: "whiskey", label: "ウイスキー", emoji: "🥃" },
  { slug: "beer", label: "ビール", emoji: "🍺" },
  { slug: "wine", label: "ワイン", emoji: "🍷" },
  { slug: "sake", label: "日本酒", emoji: "🍶" },
  { slug: "cocktail", label: "カクテル", emoji: "🍹" },
] as const;

const FEATURES = [
  {
    icon: <Wine className="h-7 w-7 text-primary" />,
    title: "記録する",
    description: "飲んだお酒を画像・評価・コメントと一緒に手帳に残しましょう。",
  },
  {
    icon: <BookOpen className="h-7 w-7 text-primary" />,
    title: "学ぶ",
    description: "ウイスキー・ビール・ワイン・日本酒・カクテルの基礎知識をわかりやすく解説。",
  },
  {
    icon: <Star className="h-7 w-7 text-primary" />,
    title: "振り返る",
    description: "お気に入りのお酒や飲み歩きの履歴を統計で振り返れます。",
  },
];

function HomeComponent() {
  return (
    <div className="mx-auto max-w-[1280px] px-6">
      {/* ヒーローセクション */}
      <section className="py-20 text-center">
        <h1 className="font-serif text-5xl font-bold leading-tight text-foreground">
          あなたの飲んだお酒を、<br className="hidden sm:block" />記録しよう。
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          The sake of Sake は、飲んだお酒を写真・評価・コメントと共に記録し、
          お酒の知識を深めるための Web アプリです。
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/signup">
            <Button size="lg" className="px-8">記録を始める</Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="px-8">ログイン</Button>
          </Link>
        </div>
      </section>

      {/* 機能紹介 */}
      <section className="py-16">
        <h2 className="mb-10 text-center font-serif text-3xl font-semibold text-foreground">
          3つの楽しみ方
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="mb-4">{f.icon}</div>
              <h3 className="mb-2 font-serif text-xl font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* カテゴリプレビュー */}
      <section className="py-16">
        <h2 className="mb-10 text-center font-serif text-3xl font-semibold text-foreground">
          お酒の知識を探す
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to="/knowledge/$category"
              params={{ category: cat.slug }}
              className="group flex flex-col items-center gap-3 rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-4xl">{cat.emoji}</span>
              <span className="font-serif text-sm font-medium text-foreground">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
