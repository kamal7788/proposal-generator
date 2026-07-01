import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isValidPublicUrl, checkRateLimit } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rateLimit = checkRateLimit("page-speed", 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    if (!isValidPublicUrl(url)) {
      return NextResponse.json({ error: "Invalid URL. Must be a valid public HTTP/HTTPS URL." }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || "";
    const keyParam = apiKey ? `&key=${apiKey}` : "";

    const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&category=accessibility&category=seo&category=best-practices&strategy=mobile${keyParam}`;
    const res = await fetch(psiUrl);
    const data = await res.json();

    if (data.error) {
      console.error("PageSpeed API error:", JSON.stringify(data.error));
      if (data.error.code === 429) {
        return NextResponse.json({ error: "PageSpeed API quota exceeded. Please try again later or configure GOOGLE_PAGESPEED_API_KEY." }, { status: 429 });
      }
      return NextResponse.json({ error: "PageSpeed API error" }, { status: 500 });
    }

    const lighthouse = data.lighthouseResult;
    const categories = lighthouse?.categories || {};

    const scores = {
      performance: Math.round((categories.performance?.score || 0) * 100),
      accessibility: Math.round((categories.accessibility?.score || 0) * 100),
      seo: Math.round((categories.seo?.score || 0) * 100),
      bestPractices: Math.round((categories["best-practices"]?.score || 0) * 100),
    };

    const speedIndex = lighthouse?.audits?.["speed-index"];
    const fcp = lighthouse?.audits?.["first-contentful-paint"];
    const tbt = lighthouse?.audits?.["total-blocking-time"];
    const cls = lighthouse?.audits?.["cumulative-layout-shift"];
    const lcp = lighthouse?.audits?.["largest-contentful-paint"];

    // Fetch desktop scores
    let desktopScores = null;
    try {
      const desktopUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&category=accessibility&category=seo&category=best-practices&strategy=desktop${keyParam}`;
      const desktopRes = await fetch(desktopUrl);
      const desktopData = await desktopRes.json();
      if (!desktopData.error) {
        const dc = desktopData.lighthouseResult?.categories || {};
        desktopScores = {
          performance: Math.round((dc.performance?.score || 0) * 100),
          accessibility: Math.round((dc.accessibility?.score || 0) * 100),
          seo: Math.round((dc.seo?.score || 0) * 100),
          bestPractices: Math.round((dc["best-practices"]?.score || 0) * 100),
        };
      }
    } catch {}

    return NextResponse.json({
      scores,
      desktopScores,
      metrics: {
        speedIndex: speedIndex?.displayValue || null,
        firstContentfulPaint: fcp?.displayValue || null,
        totalBlockingTime: tbt?.displayValue || null,
        cumulativeLayoutShift: cls?.displayValue || null,
        largestContentfulPaint: lcp?.displayValue || null,
      },
      finalUrl: lighthouse?.finalUrl || url,
    });
  } catch {
    return NextResponse.json({ error: "Failed to run PageSpeed analysis" }, { status: 500 });
  }
}
