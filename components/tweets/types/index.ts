import { IUser } from "@/components/profile/types";
import { Bookmarks, Like, Media, Post, Coin } from "@prisma/client";

export interface ITweet extends Post {
  user: IUser;
  likes: ILike[];
  media: IMedia[];
  comments: ITweet[];
  Bookmarks: IBookmark[];
  pinned_by_users: IUser[];
  _count: {
    likes: number;
    comments: number;
    Bookmarks: number;
  };
  token: String | Number;
  crypto?: Coin;
}

export interface ILike extends Like {
  user: IUser;
  tweet: ITweet;
}

export interface IInfiniteTweets {
  pages: { tweets: ITweet[]; nextId?: string | undefined }[];
  pageParams: any;
}

export interface IMedia extends Media {
  tweet: ITweet;
}

export interface IBookmark extends Bookmarks {
  user: IUser;
  tweet: ITweet;
}
