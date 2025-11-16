export interface CarouselImage {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
  thumbnailSrc?: string;
  description?: string;
}

export interface CarouselSelection {
  index: number;
  image: CarouselImage;
}

export interface CarouselSlide {
  readonly id: string;
  readonly image: CarouselImage;
  readonly itemIndex: number;
}