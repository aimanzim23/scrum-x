export interface Post {
  id: number;
  author: string;
  handle: string;
  project: string;
  time: string;
  text: string;
  phone: string | null;
  created_at: string;
}

export const defaultPosts: Post[] = [];
