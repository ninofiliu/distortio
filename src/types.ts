export type Media =
  | {
      kind: 'image';
      href: string;
      file: File;
    }
  | {
      kind: 'video';
      href: string;
      file: File;
    }
  | {
      kind: 'stream';
      stream: MediaStream;
    }
