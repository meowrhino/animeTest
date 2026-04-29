// Geocoding via OpenStreetMap Nominatim (gratis, sin key). Devuelve lat/lon + display name.
// Tiene un debounce simple incorporado vía AbortController.

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

let lastController = null;

export async function geocode(query) {
  if (!query || query.trim().length < 3) return null;
  if (lastController) lastController.abort();
  lastController = new AbortController();

  const url = `${NOMINATIM}?format=json&limit=1&accept-language=es&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      signal: lastController.signal,
      headers: { 'Accept-Language': 'es' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.length) return null;
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch (err) {
    if (err.name === 'AbortError') return null;
    console.warn('geocode failed', err);
    return null;
  }
}
