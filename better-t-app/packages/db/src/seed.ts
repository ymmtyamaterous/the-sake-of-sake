import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { knowledgeCategory, knowledgeItem } from "./schema/knowledge";

type DB = LibSQLDatabase<Record<string, unknown>>;

const categories = [
  {
    slug: "whiskey" as const,
    label: "ウイスキー",
    description: "世界中で親しまれる蒸留酒。麦芽や穀物を発酵・蒸留して熟成させた琥珀色の美酒。",
    fullDescription: `ウイスキーは穀物（主に大麦麦芽・ライ麦・トウモロコシなど）を発酵・蒸留し、木樽で熟成させた蒸留酒です。
スコットランド・アイルランド・日本・アメリカ・カナダが主要な産地として知られています。

【製造方法】
1. 糖化: 大麦麦芽の酵素でデンプンを糖に変換
2. 発酵: イーストを加えてアルコール発酵
3. 蒸留: ポットスチル（単式蒸留器）またはコフィースチル（連続式）で蒸留
4. 熟成: オーク樽に入れて数年〜数十年熟成

【楽しみ方】
ストレート・ロック・ハイボール・水割りなど様々なスタイルで楽しめます。`,
    imageUrl: null,
  },
  {
    slug: "beer" as const,
    label: "ビール",
    description: "大麦麦芽・ホップ・水・酵母から造られる世界で最も親しまれた醸造酒。",
    fullDescription: `ビールは大麦麦芽を主原料とし、ホップで苦みと香りを加え、酵母で発酵させた醸造酒です。
紀元前3000年頃のメソポタミアが起源とされ、現在は世界中で多様なスタイルが造られています。

【製造方法】
1. 麦芽製造: 大麦を発芽させてモルト（麦芽）を作る
2. 糖化: 麦芽を温水に浸して麦汁を作る
3. 煮沸: ホップを加えて煮沸し雑菌を殺菌
4. 発酵: 上面発酵（エール）または下面発酵（ラガー）

【楽しみ方】
冷やしてグラスに注ぎ、クリーミーな泡と共に楽しむのが基本です。料理との相性も抜群。`,
    imageUrl: null,
  },
  {
    slug: "wine" as const,
    label: "ワイン",
    description: "ブドウの果汁を発酵させた醸造酒。赤・白・ロゼ・スパークリングと多彩な種類がある。",
    fullDescription: `ワインはブドウを発酵させた醸造酒で、フランス・イタリア・スペインなどヨーロッパをはじめ世界中で生産されています。

【種類】
- 赤ワイン: 黒ブドウを皮ごと発酵。タンニンが特徴
- 白ワイン: 白ブドウまたは黒ブドウの果汁のみを発酵
- ロゼワイン: 黒ブドウを短時間皮ごと発酵してピンク色に
- スパークリングワイン: 二次発酵で炭酸ガスを含ませたもの

【製造方法】
1. 収穫: 品種・産地・年によって収穫時期が異なる
2. 破砕・除梗: ブドウを潰して果汁を取り出す
3. 発酵: 天然酵母または培養酵母で発酵
4. 熟成: 樽や瓶でさらに熟成させることも

【楽しみ方】
種類に応じて適切な温度管理が重要。料理との相性（マリアージュ）を楽しむのも醍醐味。`,
    imageUrl: null,
  },
  {
    slug: "sake" as const,
    label: "日本酒",
    description: "米・米麹・水を原料に醸した日本の伝統的な醸造酒。繊細な味わいと多彩な香りが魅力。",
    fullDescription: `日本酒は米・米麹・水を原料に、並行複発酵という独自の製法で醸した日本の国民的な酒です。

【製造方法】
1. 精米: 米を磨き（精米歩合）、タンパク質・脂質を除去
2. 洗米・浸漬: 精米した米を洗い、水に浸す
3. 蒸米: 米を蒸す
4. 製麹: 蒸米に麹菌をつける
5. 仕込み: 酒母・麹・蒸米・水を段階的に仕込む（三段仕込み）
6. 発酵: 約20〜30日間低温発酵
7. 搾り・火入れ: 酒粕と分離し、加熱殺菌

【分類】
- 純米酒: 米・米麹・水のみ
- 本醸造酒: 少量の醸造アルコールを添加
- 吟醸酒・大吟醸: 精米歩合60%以下・50%以下

【楽しみ方】
冷（冷たい）・常温・燗（温め）と温度帯によって風味が変わる。器も楽しみのひとつ。`,
    imageUrl: null,
  },
  {
    slug: "cocktail" as const,
    label: "カクテル",
    description: "スピリッツにジュースやリキュールなどを合わせたミックスドリンク。無限のバリエーションが魅力。",
    fullDescription: `カクテルはベースとなるスピリッツ（ウォッカ・ジン・ラムなど）に様々な副材料を合わせて作るミックスドリンクです。

【製法テクニック】
- ビルド: グラスに直接材料を注ぐ
- シェイク: シェイカーで混ぜてよく冷やす
- ステア: バースプーンでグラス内をかき混ぜる
- ブレンド: ブレンダーで混ぜる

【主なベーススピリッツ】
- ジン: ボタニカル（植物素材）の香り
- ウォッカ: クリーンで無個性。ミックスに向く
- ラム: サトウキビ由来の甘み
- テキーラ: アガベ（竜舌蘭）由来の独特な風味

【楽しみ方】
場の雰囲気や気分に合わせてベースや甘さを選ぶのが楽しみ。自宅でのホームバーも人気。`,
    imageUrl: null,
  },
  {
    slug: "other" as const,
    label: "その他",
    description: "焼酎・泡盛・梅酒・果実酒など、上記カテゴリに当てはまらないお酒。",
    fullDescription: `焼酎・泡盛・梅酒・果実酒・ブランデー・リキュールなど、ウイスキー・ビール・ワイン・日本酒・カクテル以外の多様なお酒が含まれます。

日本では焼酎が「その他」の代表格です。芋・麦・米などを原料とした蒸留酒で、お湯割り・水割り・ロックなどで楽しまれます。

泡盛は沖縄の伝統的な蒸留酒で、タイ米を原料に黒麹で発酵させて蒸留します。

梅酒・果実酒は果物と砂糖・焼酎（またはブランデー）で作る自家製でも親しまれるお酒です。`,
    imageUrl: null,
  },
] satisfies Array<typeof knowledgeCategory.$inferInsert>;

const items: Array<typeof knowledgeItem.$inferInsert> = [
  // ウイスキー
  {
    id: "ki_yamaza",
    categorySlug: "whiskey",
    name: "山崎",
    origin: "日本・大阪",
    description:
      "サントリーが手がける日本初のモルトウイスキー蒸留所「山崎蒸留所」産のシングルモルト。繊細で甘い香りと上品な余韻が特徴。",
    alcoholPercent: 43,
    tastingNotes: "ミズナラ樽由来のスパイス、甘い桃・バニラ、長い余韻",
    servingStyle: "ストレートまたは少量の水を加えて香りを開かせる",
    imageUrl: null,
  },
  {
    id: "ki_taketsuru",
    categorySlug: "whiskey",
    name: "竹鶴",
    origin: "日本・北海道",
    description:
      "ニッカウヰスキーの竹鶴政孝が創業した余市蒸留所と宮城峡蒸留所のモルト原酒をブレンドしたピュアモルト。",
    alcoholPercent: 43,
    tastingNotes: "ピーティでスモーキー、ドライフルーツと蜂蜜の甘み",
    servingStyle: "ロックまたはハイボール",
    imageUrl: null,
  },
  {
    id: "ki_macallan",
    categorySlug: "whiskey",
    name: "ザ・マッカラン",
    origin: "スコットランド・スペイサイド",
    description: "シングルモルトスコッチの王様と呼ばれるマッカラン蒸留所産。シェリー樽熟成による豊かな風味が世界的に高評価。",
    alcoholPercent: 43,
    tastingNotes: "ドライフルーツ・チョコレート・シナモン、シェリー樽の甘み",
    servingStyle: "ストレートまたは加水してゆっくり味わう",
    imageUrl: null,
  },
  {
    id: "ki_glenfiddich",
    categorySlug: "whiskey",
    name: "グレンフィディック",
    origin: "スコットランド・スペイサイド",
    description: "世界で最も売れているシングルモルトスコッチ。フルーティで爽やかな味わいで初心者にも人気。",
    alcoholPercent: 40,
    tastingNotes: "洋梨・リンゴ・クリーミーなオーク、軽やかな甘み",
    servingStyle: "ハイボールやソーダ割りでも美味しい",
    imageUrl: null,
  },
  {
    id: "ki_ballantine",
    categorySlug: "whiskey",
    name: "バランタイン",
    origin: "スコットランド",
    description: "スコッチブレンデッドウイスキーの王者。柔らかくバランスの取れた味わいで世界中で愛飲されている。",
    alcoholPercent: 40,
    tastingNotes: "蜂蜜・バニラ・トフィー、スムースな余韻",
    servingStyle: "水割りやハイボールで食事と共に",
    imageUrl: null,
  },
  // ビール
  {
    id: "bi_heartland",
    categorySlug: "beer",
    name: "ハートランド",
    origin: "日本",
    description: "キリンビールのプレミアムブランド。ドイツのホップを使用した透き通ったゴールドと爽快な苦みが特徴。",
    alcoholPercent: 5,
    tastingNotes: "ホップの爽やかな苦み、すっきりとした喉越し",
    servingStyle: "よく冷やしてグラスに注ぐ",
    imageUrl: null,
  },
  {
    id: "bi_ichibanshibori",
    categorySlug: "beer",
    name: "一番搾り",
    origin: "日本",
    description: "キリンビールの看板商品。麦汁を一番最初に搾ったもの（一番麦汁）のみを使用した贅沢なラガービール。",
    alcoholPercent: 5,
    tastingNotes: "雑味のないクリアな旨み、麦の甘みと上品な苦み",
    servingStyle: "冷蔵庫で冷やし、グラスを傾けながら注いで泡を作る",
    imageUrl: null,
  },
  {
    id: "bi_yonayone",
    categorySlug: "beer",
    name: "よなよなエール",
    origin: "日本・長野",
    description: "ヤッホーブルーイングが手がけるジャパニーズクラフトビールのパイオニア。華やかなホップの香りが広がるアメリカンペールエール。",
    alcoholPercent: 5.5,
    tastingNotes: "柑橘系ホップの華やかな香り、しっかりした苦みとモルトの甘み",
    servingStyle: "常温で香りを楽しんだ後、少し冷やして飲むのもおすすめ",
    imageUrl: null,
  },
  {
    id: "bi_ebisu",
    categorySlug: "beer",
    name: "エビスビール",
    origin: "日本",
    description: "サッポロビールのプレミアムブランド。伝統的なヨーロピアンラガースタイルで、コクと深みある味わい。",
    alcoholPercent: 5,
    tastingNotes: "深いモルトのコク、豊かな泡とホップのバランス",
    servingStyle: "グラスに注いでゆっくり味わう",
    imageUrl: null,
  },
  {
    id: "bi_shironaho",
    categorySlug: "beer",
    name: "白穂乃香",
    origin: "日本",
    description: "キリンが手がける白ビール（ヴァイツェン）。小麦麦芽由来のフルーティな香りとほのかな酸味が特徴。",
    alcoholPercent: 4.5,
    tastingNotes: "バナナ・クローブのエステル香、まろやかな口当たり",
    servingStyle: "冷やしすぎず10℃前後で酵母ごと注いで",
    imageUrl: null,
  },
  // ワイン
  {
    id: "wi_margaux",
    categorySlug: "wine",
    name: "シャトー・マルゴー",
    origin: "フランス・ボルドー",
    description: "ボルドー5大シャトーのひとつ。カベルネ・ソーヴィニヨン主体の格調高い赤ワインで「ワインの女王」とも呼ばれる。",
    alcoholPercent: 13,
    tastingNotes: "黒ベリー・スミレ・タバコ・複雑なタンニン、長い余韻",
    servingStyle: "18〜20℃でデキャンタージュ後に味わう",
    imageUrl: null,
  },
  {
    id: "wi_montrachet",
    categorySlug: "wine",
    name: "モンラッシェ",
    origin: "フランス・ブルゴーニュ",
    description: "世界最高峰の白ワインとして名高いシャルドネ100%の白ワイン。ブルゴーニュ・コート・ド・ボーヌ産のグラン・クリュ。",
    alcoholPercent: 13.5,
    tastingNotes: "蜂蜜・アーモンド・バタートースト、長く続くミネラル感",
    servingStyle: "12〜14℃で大きめのグラスに注いでゆっくり",
    imageUrl: null,
  },
  {
    id: "wi_domperignon",
    categorySlug: "wine",
    name: "ドン・ペリニョン",
    origin: "フランス・シャンパーニュ",
    description: "モエ・エ・シャンドンのプレステージシャンパン。シャルドネとピノ・ノワールのブレンドで緻密な泡と複雑な香りが特徴。",
    alcoholPercent: 12.5,
    tastingNotes: "白桃・柑橘・ブリオッシュ、きめ細かい泡と長い余韻",
    servingStyle: "よく冷やした8〜10℃でフルートグラスに",
    imageUrl: null,
  },
  // 日本酒
  {
    id: "sa_dassai",
    categorySlug: "sake",
    name: "獺祭",
    origin: "山口県",
    description: "旭酒造が手がける純米大吟醸酒。精米歩合23%まで磨いた「獺祭 二割三分」が特に有名。フルーティな香りと上品な甘さが特徴。",
    alcoholPercent: 16,
    tastingNotes: "メロン・桃のような香り、滑らかで上品な甘み",
    servingStyle: "10〜15℃に冷やして、ワイングラスで香りを楽しむ",
    imageUrl: null,
  },
  {
    id: "sa_kubota",
    categorySlug: "sake",
    name: "久保田",
    origin: "新潟県",
    description: "朝日酒造が生む辛口淡麗な新潟清酒を代表する銘柄。「久保田 萬寿」「千寿」など複数のラインナップで展開。",
    alcoholPercent: 15,
    tastingNotes: "すっきりとしたキレ、米の旨みと爽やかな辛口",
    servingStyle: "冷（10℃前後）または常温で食中酒として",
    imageUrl: null,
  },
  {
    id: "sa_hakkaisan",
    categorySlug: "sake",
    name: "八海山",
    origin: "新潟県",
    description: "八海醸造が八海山の名水で仕込む、全国的に人気の高い新潟清酒。淡麗辛口の中にも旨みがある。",
    alcoholPercent: 15.5,
    tastingNotes: "柔らかな米の甘み、スッキリとした辛口の後味",
    servingStyle: "冷や・常温・ぬる燗と幅広く楽しめる万能酒",
    imageUrl: null,
  },
  {
    id: "sa_niida",
    categorySlug: "sake",
    name: "新政",
    origin: "秋田県",
    description: "新政酒造が6号酵母発祥の蔵で醸す自然派日本酒。全量秋田米・自然発酵にこだわり独自の世界観を持つ。",
    alcoholPercent: 14,
    tastingNotes: "フレッシュな酸味、乳酸発酵由来のヨーグルト感、軽やかな甘み",
    servingStyle: "10〜12℃に冷やしてワイングラスで",
    imageUrl: null,
  },
  // カクテル
  {
    id: "co_moscowmule",
    categorySlug: "cocktail",
    name: "モスコミュール",
    origin: "アメリカ",
    description: "ウォッカ・ライムジュース・ジンジャービアを銅製マグカップに注いだカクテル。爽快な辛みと爽やかさが人気。",
    alcoholPercent: 8,
    tastingNotes: "ジンジャーの辛み、ライムの酸味、スッキリとした清涼感",
    servingStyle: "銅製マグカップに氷を入れて、よく冷やして提供",
    imageUrl: null,
  },
  {
    id: "co_gintonic",
    categorySlug: "cocktail",
    name: "ジン・トニック",
    origin: "イギリス",
    description: "ジンをトニックウォーターで割るシンプルなカクテル。ジンの個性とトニックの苦みが絶妙に合わさる。",
    alcoholPercent: 7,
    tastingNotes: "ジンのボタニカル香、トニックの甘みとほろ苦さ",
    servingStyle: "ハイボールグラスに氷をたっぷり入れ、ライムを添えて",
    imageUrl: null,
  },
  {
    id: "co_negroni",
    categorySlug: "cocktail",
    name: "ネグローニ",
    origin: "イタリア",
    description: "ジン・スイートベルモット・カンパリを等分ステアしたクラシックカクテル。苦みと甘みのバランスが芸術的。",
    alcoholPercent: 24,
    tastingNotes: "カンパリの苦み、ベルモットの甘み、ジンのハーブ香",
    servingStyle: "ロックグラスに大きな氷を入れてオレンジピールを添える",
    imageUrl: null,
  },
  {
    id: "co_margarita",
    categorySlug: "cocktail",
    name: "マルガリータ",
    origin: "メキシコ",
    description: "テキーラ・コアントロー・ライムジュースをシェイクしたカクテル。グラスのリムに塩をつけるスノースタイルが定番。",
    alcoholPercent: 15,
    tastingNotes: "テキーラのアガベ風味、ライムの酸味、塩とのコントラスト",
    servingStyle: "グラスの縁に塩（スノースタイル）をつけてサービス",
    imageUrl: null,
  },
  {
    id: "co_daiquiri",
    categorySlug: "cocktail",
    name: "ダイキリ",
    origin: "キューバ",
    description: "ラム・ライムジュース・砂糖をシェイクしたクラシックカクテル。ヘミングウェイが愛したカクテルとしても有名。",
    alcoholPercent: 20,
    tastingNotes: "ラムの甘い香り、ライムの爽やかな酸味、すっきりとした甘酸っぱさ",
    servingStyle: "よく冷やしたカクテルグラスにシェイクして注ぐ",
    imageUrl: null,
  },
];

export async function seed(db: DB) {
  console.log("🌱 Seeding knowledge data...");

  for (const category of categories) {
    await db
      .insert(knowledgeCategory)
      .values(category)
      .onConflictDoNothing()
      .execute();
  }

  for (const item of items) {
    await db
      .insert(knowledgeItem)
      .values(item)
      .onConflictDoNothing()
      .execute();
  }

  console.log("✅ Seeding complete");
}
