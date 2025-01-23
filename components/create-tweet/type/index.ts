export interface IChosenImages {
  url: string | ArrayBuffer | null;
  id: number;
  file: File;
  width: number;
  height: number;
  type?: "image" | "video" | "gif";
}

export interface Post {
  id: string;
}
