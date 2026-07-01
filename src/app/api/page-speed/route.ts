import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isValidPublicUrl, checkRateLimit } from "@/lib/utils";

async function fetchWithTimeout(url: string, timeoutMs = 30000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

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
    const categories = "category=performance&category=accessibility&category=seo&category=best-practices";

    const mobileUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&${categories}&strategy=mobile${keyParam}`;
    const desktopUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&${categories}&strategy=desktop${keyParam}`;

    const [mobileRes, desktopRes] = await Promise.allSettled([
      fetchWithTimeout(mobileUrl, 45000),
      fetchWithTimeout(desktopUrl, 45000),
    ]);

    let scores = { performance: 0, accessibility: 0, seo: 0, bestPractices: 0, agenticBrowsing: 0 };
    let metrics: any = {};

    if (mobileRes.status === "fulfilled") {
      const mobileData = await mobileRes.value.json();
      if (mobileData.error) {
        if (mobileData.error.code === 429) {
          return NextResponse.json({ error: "PageSpeed API quota exceeded. Please try again later or configure GOOGLE_PAGESPEED_API_KEY." }, { status: 429 });
        }
        return NextResponse.json({ error: "PageSpeed API error: " + (mobileData.error.message || "Unknown") }, { status: 500 });
      }
      const lighthouse = mobileData.lighthouseResult;
      const cats = lighthouse?.categories || {};
      scores = {
        performance: Math.round((cats.performance?.score || 0) * 100),
        accessibility: Math.round((cats.accessibility?.score || 0) * 100),
        seo: Math.round((cats.seo?.score || 0) * 100),
        bestPractices: Math.round((cats["best-practices"]?.score || 0) * 100),
        agenticBrowsing: Math.round((cats["agentic-browsing"]?.score || cats["experimental"]?.score || 0) * 100),
      };
      metrics = {
        speedIndex: lighthouse?.audits?.["speed-index"]?.displayValue || null,
        firstContentfulPaint: lighthouse?.audits?.["first-contentful-paint"]?.displayValue || null,
        totalBlockingTime: lighthouse?.audits?.["total-blocking-time"]?.displayValue || null,
        cumulativeLayoutShift: lighthouse?.audits?.["cumulative-layout-shift"]?.displayValue || null,
        largestContentfulPaint: lighthouse?.audits?.["largest-contentful-paint"]?.displayValue || null,
      };
    }

    let desktopScores = null;
    if (desktopRes.status === "fulfilled") {
      const desktopData = await desktopRes.value.json();
      if (!desktopData.error) {
        const dc = desktopData.lighthouseResult?.categories || {};
        desktopScores = {
          performance: Math.round((dc.performance?.score || 0) * 100),
          accessibility: Math.round((dc.accessibility?.score || 0) * 100),
          seo: Math.round((dc.seo?.score || 0) * 100),
          bestPractices: Math.round((dc["best-practices"]?.score || 0) * 100),
        };
      }
    }

    return NextResponse.json({
      scores,
      desktopScores,
      metrics,
      finalUrl: url,
    });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return NextResponse.json({ error: "PageSpeed analysis timed out. Please try again." }, { status: 504 });
    }
    return NextResponse.json({ error: "Failed to run PageSpeed analysis" }, { status: 500 });
  }
}
