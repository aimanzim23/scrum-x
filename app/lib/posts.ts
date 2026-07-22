export interface Post {
  id: number;
  author: string;
  handle: string;
  project: string;
  time: string;
  text: string;
  phone: string | null;
  is_draft: boolean;
  created_at: string;
}

export const defaultPosts: Post[] = [];
