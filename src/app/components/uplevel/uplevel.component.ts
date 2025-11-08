import { ChangeDetectionStrategy, Component, HostBinding, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'uplevel',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <button
      type="button"
      class="uplevel__button"
      mat-icon-button
      (click)="activated.emit()"
      aria-label="Navigate up one level"
    >
      <mat-icon aria-hidden="true">north_west</mat-icon>
      <span class="visually-hidden">Navigate up one level</span>
    </button>
  `,
  styles: [`
    :host {
      display: inline-flex;
      width: 72px;
      height: 48px;
    }

    .uplevel__button {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 18px;
      background: linear-gradient(135deg, var(--mdc-theme-primary, #1976d2), #63a4ff);
      color: #fff;
      box-shadow: 0 8px 20px rgba(25, 118, 210, 0.3);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: transform 160ms ease, box-shadow 160ms ease;
    }

    .uplevel__button mat-icon {
      font-size: 28px;
    }

    .uplevel__button:hover,
    .uplevel__button:focus-visible {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(25, 118, 210, 0.38);
    }

    @media (max-width: 600px) {
      :host {
        width: 64px;
        height: 44px;
      }

      .uplevel__button mat-icon {
        font-size: 26px;
      }
    }

    @media (max-width: 480px) {
      :host {
        width: 56px;
        height: 40px;
      }

      .uplevel__button {
        border-radius: 14px;
      }

      .uplevel__button mat-icon {
        font-size: 24px;
      }
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UplevelComponent {
  readonly activated = output<void>();
}
