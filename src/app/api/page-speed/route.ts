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

    const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&category=accessibility&category=seo&category=best-practices&strategy=mobile`;
    const res = await fetch(psiUrl);
    const data = await res.json();

    if (data.error) {
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

    return NextResponse.json({
      scores,
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
