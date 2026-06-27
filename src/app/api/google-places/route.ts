import { NextRequest, NextResponse } from "next/server";
import { searchPlaces, getPlaceDetails, isGoogleApiKeyConfigured } from "@/lib/google-places";

export async function POST(req: NextRequest) {
  try {
    if (!isGoogleApiKeyConfigured()) {
      return NextResponse.json({
        error: "Google Places API key is not configured. Please add GOOGLE_PLACES_API_KEY to your Coolify environment variables. You can get a free key from Google Cloud Console (enable Places API).",
        configured: false,
      }, { status: 503 });
    }

    const { query, placeId } = await req.json();

    if (placeId) {
      const details = await getPlaceDetails(placeId);
      return NextResponse.json(details);
    }

    if (!query) return NextResponse.json({ error: "query or placeId required" }, { status: 400 });

    const results = await searchPlaces(query);
    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Google Places API error:", error.message);
    return NextResponse.json({ error: error.message || "Google Places API error" }, { status: 500 });
  }
}
