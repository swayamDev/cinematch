export interface MovieMeta {
  title: string;
  year: string | null;
  rating: string | null;
  poster: string | null;
  plot: string | null;
}

export interface RecommendationItem {
  title: string;
  score: number;
  meta: MovieMeta | null;
}
