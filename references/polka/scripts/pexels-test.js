#!/usr/bin/env node

async function searchPexelsPhoto(query, apiKey, { perPage = 1, page = 1 } = {}) {
  if (!apiKey) {
    throw new Error("PEXELS_API_KEY is not set");
  }

  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("page", String(page));

  const response = await fetch(url, {
    headers: {
      Authorization: apiKey
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Pexels API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  return data.photos ?? [];
}

async function main() {
  const apiKey = process.env.PEXELS_API_KEY;
  const query = process.argv[2] || "кафе";
  const photos = await searchPexelsPhoto(query, apiKey, { perPage: 1, page: 1 });

  if (!photos.length) {
    console.log("No photos found");
    return;
  }

  const first = photos[0];
  console.log(
    JSON.stringify(
      {
        query,
        id: first.id,
        photographer: first.photographer,
        preview: first.src?.medium,
        original: first.src?.original
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
