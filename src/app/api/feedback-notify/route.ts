import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl || webhookUrl === "YOUR_DISCORD_WEBHOOK_URL_HERE") {
    return NextResponse.json({ error: "Discord webhook not configured" }, { status: 503 });
  }

  let body: {
    pageUrl?: string;
    pageTitle?: string;
    sectionId?: string;
    sectionTitle?: string;
    sectionUrl?: string;
    type?: string;
    text?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { pageUrl, pageTitle, sectionId, sectionTitle, sectionUrl, type, text } = body;

  if (!text?.trim()) {
    return NextResponse.json({ error: "Empty feedback" }, { status: 400 });
  }

  // Clickable link helpers using Discord markdown
  const pageLink = pageUrl
    ? `[${pageTitle || pageUrl}](${pageUrl})`
    : pageTitle || "Unknown";

  const sectionLink = sectionUrl
    ? `[${sectionTitle || sectionId || "View section"}](${sectionUrl})`
    : sectionTitle || sectionId || "Unknown";

  // Build a rich Discord embed
  const embed = {
    title: "📬 New Feedback Received",
    url: pageUrl, // makes the embed title itself clickable to the page
    color: 0x5865f2, // Discord blurple
    fields: [
      { name: "📄 Page", value: pageLink, inline: false },
      { name: "📌 Section", value: sectionLink, inline: false },
      { name: "🏷️ Type", value: type || "Unknown", inline: true },
      { name: "💬 Message", value: text, inline: false },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "Penquin Feedback System" },
  };

  const discordRes = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  });

  if (!discordRes.ok) {
    const err = await discordRes.text();
    console.error("Discord webhook error:", err);
    return NextResponse.json({ error: "Failed to notify Discord" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
