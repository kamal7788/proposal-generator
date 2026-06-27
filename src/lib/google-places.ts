const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
  rating: number | null;
  reviewCount: number;
  totalScore: number;
  types: string[];
  openingHours: any | null;
  photos: string[];
  reviews: { author: string; rating: number; text: string; time: string; profilePhoto: string }[];
  location: { lat: number; lng: number };
}

export async function searchPlaces(query: string): Promise<{ placeId: string; name: string; address: string }[]> {
  if (!GOOGLE_API_KEY) throw new Error("GOOGLE_PLACES_API_KEY not configured");
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") throw new Error(`Places API error: ${data.status}`);
  return (data.candidates || []).map((c: any) => ({
    placeId: c.place_id,
    name: c.name,
    address: c.formatted_address,
  }));
}

export async function getPlaceDetails(placeId: string): Promise<PlaceResult> {
  if (!GOOGLE_API_KEY) throw new Error("GOOGLE_PLACES_API_KEY not configured");
  const fields = "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,types,opening_hours,photos,reviews,geometry";
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== "OK") throw new Error(`Place Details error: ${data.status}`);
  const p = data.result;
  return {
    placeId,
    name: p.name || "",
    address: p.formatted_address || "",
    phone: p.formatted_phone_number || null,
    website: p.website || null,
    rating: p.rating || null,
    reviewCount: p.user_ratings_total || 0,
    totalScore: p.rating ? Math.round((p.rating / 5) * 100) : 0,
    types: p.types || [],
    openingHours: p.opening_hours || null,
    photos: (p.photos || []).slice(0, 5).map((ph: any) =>
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${ph.photo_reference}&key=${GOOGLE_API_KEY}`
    ),
    reviews: (p.reviews || []).slice(0, 10).map((r: any) => ({
      author: r.author_name || "",
      rating: r.rating || 0,
      text: r.text || "",
      time: r.relative_time_description || "",
      profilePhoto: r.profile_photo_url || "",
    })),
    location: {
      lat: p.geometry?.location?.lat || 0,
      lng: p.geometry?.location?.lng || 0,
    },
  };
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!GOOGLE_API_KEY) return null;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== "OK" || !data.results?.[0]) return null;
  return data.results[0].geometry.location;
}

export async function generateSeoGrid(
  lat: number,
  lng: number,
  gridSize: number = 7,
  gridSpacingMeters: number = 500,
): Promise<{ row: number; col: number; lat: number; lng: number; rank: number | null }[]> {
  const grid: { row: number; col: number; lat: number; lng: number; rank: number | null }[] = [];
  const meterstoDegLat = 1 / 111320;
  const meterstoDegLng = 1 / (111320 * Math.cos((lat * Math.PI) / 180));

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const offsetLat = (row - Math.floor(gridSize / 2)) * gridSpacingMeters * meterstoDegLat;
      const offsetLng = (col - Math.floor(gridSize / 2)) * gridSpacingMeters * meterstoDegLng;
      grid.push({
        row,
        col,
        lat: lat + offsetLat,
        lng: lng + offsetLng,
        rank: null,
      });
    }
  }
  return grid;
}
