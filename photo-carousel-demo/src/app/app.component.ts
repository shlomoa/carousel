import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PhotoCarouselComponent, CarouselImage } from './photo-carousel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, PhotoCarouselComponent],
  template: `
  <mat-toolbar color="primary">
    <span>Photo Carousel Demo</span>
    <span class="spacer"></span>
    <a mat-button href="https://picsum.photos/" target="_blank" rel="noopener">Photos by Picsum</a>
  </mat-toolbar>

  <main class="container">
    <photo-carousel
      [images]="images"
      [loop]="true"
      [autoplayMs]="6000"
      ariaLabel="Sample trip photos"
    ></photo-carousel>
  </main>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
    .container { max-width: 960px; margin: 24px auto; padding: 0 16px; }
    photo-carousel { display:block; aspect-ratio: 16 / 9; }
    @media (max-width: 599px) {
      photo-carousel { aspect-ratio: 4 / 3; }
    }
  `]
})
export class AppComponent {
  images: CarouselImage[] = [
    { src: 'https://picsum.photos/id/1015/1200/800', alt: 'Mountain lake', caption: 'Lake, early morning', width: 1200, height: 800 },
    { src: 'https://picsum.photos/id/1025/1200/800', alt: 'Puppy', caption: 'Puppy portrait', width: 1200, height: 800 },
    { src: 'https://picsum.photos/id/1039/1200/800', alt: 'Desert road', caption: 'Desert highway', width: 1200, height: 800 },
    { src: 'https://picsum.photos/id/1041/1200/800', alt: 'Cliff', caption: 'Cliffs by the sea', width: 1200, height: 800 },
  ];
}
