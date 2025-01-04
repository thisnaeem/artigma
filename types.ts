export interface SearchParams {
  query: string;
  page: number;
  limit: number;
  contentType: {
    photo: boolean;
    illustration: boolean;
    vector: boolean;
    video: boolean;
    template: boolean;
    "3d": boolean;
    audio: boolean;
  };
  safeSearch: boolean;
}

export interface SearchResult {
  id: string;
  title: string;
  thumbnailUrl: string;
}

export interface SearchResponse {
  items: SearchResult[];
  total: number;
  num_pages: number;
} 