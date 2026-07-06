export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  cover_avatar_url: string | null;
  bio: string | null;
  genre_prefs: string[];
  created_at: string;
};

export type Movie = {
  id: string;
  title: string;
  year: number;
  genres: string[];
  poster_url: string;
  backdrop_url: string | null;
  synopsis: string | null;
  rating: number | null;
  trailer_url: string | null;
};

export type Post = {
  id: string;
  user_id: string;
  image_urls: string[];
  caption: string | null;
  created_at: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  bookmark_count: number;
  liked_by_me?: boolean;
  bookmarked_by_me?: boolean;
  author: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
};

export type WatchlistItem = {
  id: string;
  user_id: string;
  movie_id: string;
  created_at: string;
  movie: Movie;
};

export type Swipe = {
  id: string;
  user_id: string;
  movie_id: string;
  direction: "left" | "right";
  created_at: string;
};

export type Conversation = {
  id: string;
  is_group: boolean;
  title: string | null;
  updated_at: string;
  participants: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">[];
  last_message: Message | null;
  unread_count: number;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export type FeedTab = "global" | "friends" | "recommended";
