import { NextRequest, NextResponse } from "next/server";
import { searchPlaces, getPlaceDetails } from "@/lib/google-places";

export async function POST(req: NextRequest) {
  try {
    const { query, placeId } = await req.json();

    if (placeId) {
      const details = await getPlaceDetails(placeId);
      return NextResponse.json(details);
    }

    if (!query) return NextResponse.json({ error: "query or placeId required" }, { status: 400 });

    const results = await searchPlaces(query);
    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Google Places API error" }, { status: 500 });
  }
}
