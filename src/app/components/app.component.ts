import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  ImageCarouselComponent,
  SelectionDetailsComponent,
  CarouselSelection,
} from '@shlomoa/mat-image-carousel';
import { ImagesService } from '../services/images.service';

@Component({
  selector: 'app-root',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, ImageCarouselComponent, SelectionDetailsComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly imagesService = inject(ImagesService);

  readonly images = this.imagesService.images;

  private readonly selection = signal<CarouselSelection | null>(null);

  readonly selectedIndex = computed(() => this.selection()?.index ?? null);
  readonly selectedImage = computed(() => this.selection()?.image ?? null);

  onSelectionChange(selection: CarouselSelection) {
    this.selection.set(selection);
  }
}
