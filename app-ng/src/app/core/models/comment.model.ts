import { Profile } from './article.model';

/** RealWorld comment (subset consumed by the app). */
export interface Comment {
  id: number;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: Profile;
}
