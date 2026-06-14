export interface Post {
  id: number;
  author: string;
  handle: string;
  project: string;
  time: string;
  text: string;
}

export const defaultPosts: Post[] = [];
