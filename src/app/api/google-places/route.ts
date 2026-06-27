import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchPlaces, getPlaceDetails, isGoogleApiKeyConfigured } from "@/lib/google-places";
import { checkRateLimit } from "@/lib/utils";

function sanitizeInput(input: string): string {
  return input.replace(/[<>"'`;]/g, "").substring(0, 500);
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rateLimit = checkRateLimit("google-places", 15, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    if (!isGoogleApiKeyConfigured()) {
      return NextResponse.json({
        error: "Google Places API key is not configured.",
        configured: false,
      }, { status: 503 });
    }

    const { query, placeId } = await req.json();

    if (placeId) {
      const sanitizedPlaceId = sanitizeInput(placeId);
      if (!sanitizedPlaceId || sanitizedPlaceId.length < 5) {
        return NextResponse.json({ error: "Invalid placeId" }, { status: 400 });
      }
      const details = await getPlaceDetails(sanitizedPlaceId);
      return NextResponse.json(details);
    }

    if (!query) return NextResponse.json({ error: "query or placeId required" }, { status: 400 });

    const sanitizedQuery = sanitizeInput(query);
    if (!sanitizedQuery || sanitizedQuery.length < 2) {
      return NextResponse.json({ error: "Query too short" }, { status: 400 });
    }

    const results = await searchPlaces(sanitizedQuery);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Google Places API error" }, { status: 500 });
  }
}
