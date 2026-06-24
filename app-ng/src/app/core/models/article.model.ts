/** RealWorld author/profile (subset consumed by the app). */
export interface Profile {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

/** RealWorld article (subset consumed by the app). */
export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: Profile;
}

/** Response envelope for a list of articles. */
export interface ArticleListResponse {
  articles: Article[];
  articlesCount: number;
}

/** Query configuration for the article list. */
export interface ArticleQuery {
  /** 'all' → GET /articles; 'feed' → GET /articles/feed. */
  type: 'all' | 'feed';
  filters?: {
    tag?: string;
    author?: string;
    favorited?: string;
    limit?: number;
    offset?: number;
  };
}
