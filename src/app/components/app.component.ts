import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  ImageCarouselComponent,
  SelectionDetailsComponent,
  CarouselImage,
  CarouselSelection,
} from '@shlomoa/mat-image-carousel';

@Component({
  selector: 'app-root',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, ImageCarouselComponent, SelectionDetailsComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly images = signal<CarouselImage[]>([
    { src: 'https://picsum.photos/id/1015/1200/800', alt: 'Mountain lake', caption: 'Lake, early morning', width: 1200, height: 800 },
    { src: 'https://picsum.photos/id/1025/1200/800', alt: 'Puppy', caption: 'Puppy portrait', width: 1200, height: 800 },
    { src: 'https://picsum.photos/id/1039/1200/800', alt: 'Desert road', caption: 'Desert highway', width: 1200, height: 800 },
    { src: 'https://picsum.photos/id/1041/1200/800', alt: 'Cliff', caption: 'Cliffs by the sea', width: 1200, height: 800 },
    { src: 'https://picsum.photos/id/1035/1200/800', alt: 'Rainbow', caption: 'Being in Awh', width: 1200, height: 800 },
  ]);

  private readonly selection = signal<CarouselSelection | null>(null);

  readonly selectedIndex = computed(() => this.selection()?.index ?? null);
  readonly selectedImage = computed(() => this.selection()?.image ?? null);

  onSelectionChange(selection: CarouselSelection) {
    this.selection.set(selection);
  }
}
