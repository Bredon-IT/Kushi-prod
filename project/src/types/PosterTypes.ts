export interface PosterDTO {
  id: number;
  imageUrl: string;
  title?: string;
  linkUrl?: string;
  position?: number; // e.g., order in the carousel
  startDate?: string; // ISO yyyy-MM-dd
  endDate?: string;   // ISO yyyy-MM-dd
  active?: boolean;
}
