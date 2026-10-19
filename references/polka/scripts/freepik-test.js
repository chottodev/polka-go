#!/usr/bin/env node

async function searchFreepikResources(term, apiKey, { limit = 3, page = 1 } = {}) {
  if (!apiKey) {
    throw new Error("FREEPIK_API_KEY is not set");
  }

  const url = new URL("https://api.freepik.com/v1/resources");
  url.searchParams.set("term", term);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("page", String(page));

  const response = await fetch(url, {
    headers: {
      "x-freepik-api-key": apiKey,
      "Accept-Language": "ru-RU"
    }
  });

  const bodyText = await response.text();
  let data;
  try {
    data = JSON.parse(bodyText);
  } catch {
    data = { raw: bodyText };
  }

  if (!response.ok) {
    throw new Error(
      `Freepik API error ${response.status}: ${JSON.stringify(data)}`
    );
  }

  return data;
}

async function main() {
  const apiKey = process.env.FREEPIK_API_KEY;
  const term = process.argv[2] || "кафе";
  const result = await searchFreepikResources(term, apiKey);

  const items = Array.isArray(result?.data) ? result.data : [];
  const preview = items.slice(0, 3).map((item) => ({
    id: item.id,
    title: item.title,
    url: item.url,
    image: item.image?.source?.url || item.image?.url || null
  }));

  console.log(
    JSON.stringify(
      {
        term,
        total: result?.meta?.pagination?.total || items.length,
        returned: items.length,
        items: preview
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
