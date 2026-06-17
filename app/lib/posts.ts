export interface Post {
  id: number;
  author: string;
  handle: string;
  project: string;
  time: string;
  text: string;
  phone: string | null;
}

export const defaultPosts: Post[] = [];
