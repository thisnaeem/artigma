// app/api/search/route.ts

import { SearchParams, SearchResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const params: SearchParams = await request.json();

  const url = new URL("https://stock.adobe.com/Ajax/Search");
  url.searchParams.append("k", params.query);
  url.searchParams.append("limit", params.limit.toString());
  url.searchParams.append("search_page", params.page.toString());
  url.searchParams.append("safe_search", params.safeSearch ? "1" : "0");

  // Add the fixed parameters
  url.searchParams.append("order", "relevance");
  url.searchParams.append("search_type", "pagination");
  url.searchParams.append("get_facets", "0");

  // Update content type filters
  Object.entries(params.contentType).forEach(([key, value]) => {
    url.searchParams.append(`filters[content_type:${key}]`, value ? "1" : "0");
  });

  // Update other filters
  url.searchParams.append("filters[include_stock_enterprise]", "0");
  url.searchParams.append("filters[is_editorial]", "0");
  url.searchParams.append("filters[free_collection]", "0");

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const data: SearchResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching data" },
      { status: 500 }
    );
  }
}
