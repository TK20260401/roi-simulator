import Anthropic from "@anthropic-ai/sdk";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("basic_auth")?.value === "authenticated";
}

const SYSTEM_PROMPT = `あなたは「AI Strategy Agent」のアシスタントです。
このアプリは、AIコールセンターシステム導入のROI（投資対効果）をシミュレーションするツールです。

あなたの役割：
- ユーザーがコスト項目の入力で迷っている時に、適切な値のガイドを提供する
- ROI・投資回収期間・年間効果額の意味をわかりやすく説明する
- 業界平均や一般的なベンチマークの情報を提供する
- シミュレーション結果の解釈をサポートする
- KGI/KPIの設定方法をアドバイスする

注意点：
- 簡潔に回答してください（3-5文程度）
- 専門用語は避け、ビジネスパーソンにわかりやすい言葉を使ってください
- 具体的な数値例を交えて説明してください
- 日本語で回答してください`;

export async function POST(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      reply: "AIアシスタントは現在準備中です。ANTHROPIC_API_KEYが設定されていません。\n\nヘルプページで使い方をご確認ください。",
    });
  }

  const { message, context } = await request.json();

  try {
    const client = new Anthropic({ apiKey });

    const userMessage = context
      ? `現在のシミュレーション状況:\n${context}\n\nユーザーの質問: ${message}`
      : message;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const reply = response.content[0].type === "text" ? response.content[0].text : "回答を生成できませんでした。";

    return NextResponse.json({ reply });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "エラーが発生しました";
    return NextResponse.json({ reply: `エラー: ${errorMessage}` }, { status: 500 });
  }
}
