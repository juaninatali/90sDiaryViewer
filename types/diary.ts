export type DiaryEntry = {
    id: string;
    title: string;
    date: string; // ISO date format like "1992-03-15"
    location: string;
    tags: string[];
    text: string;
    images: string[];
  };
  