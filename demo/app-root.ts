import {
  css,
  CSSResult,
  customElement,
  html,
  internalProperty,
  LitElement,
  query,
  TemplateResult,
} from 'lit-element';
import './responsive-nav/responsive-nav';
import { ResponsiveNav } from './responsive-nav/responsive-nav';
import {
  SharedResizeObserver,
  SharedResizeObserverInterface,
  SharedResizeObserverResizeHandlerInterface,
} from '../src/shared-resize-observer';
import './responsive-device';
import { Device } from './responsive-device';
import { nothing } from 'lit-html';

@customElement('app-root')
export class AppRoot
  extends LitElement
  implements SharedResizeObserverResizeHandlerInterface {
  @query('#show-borders-check') showBordersCheck!: HTMLInputElement;
  @query('#show-extra-nav') showNavCheck!: HTMLInputElement;
  @query('#constrained-width-check') constrainedWidthCheck!: HTMLInputElement;
  @query('#constrained-width-slider') constrainedWidthSlider!: HTMLInputElement;
  @query('#constrained-width-value') constrainedWidthValue!: HTMLSpanElement;
  @query('#item-spacing-slider') itemSpacingSlider!: HTMLInputElement;
  @query('#item-spacing-value') itemSpacingValue!: HTMLSpanElement;
  @query('#font-size-slider') fontSizeSlider!: HTMLInputElement;
  @query('#font-size-value') fontSizeValue!: HTMLSpanElement;
  @query('#icon-size-slider') iconSizeSlider!: HTMLInputElement;
  @query('#icon-size-value') iconSizeValue!: HTMLSpanElement;
  @query('#menu-gap-slider') menuGapSlider!: HTMLInputElement;
  @query('#menu-gap-value') menuGapValue!: HTMLSpanElement;

  @query('responsive-nav') nav!: ResponsiveNav;

  @internalProperty()
  private device: Device = Device.macBook;

  @internalProperty()
  private showDevOutline = false;

  @internalProperty()
  private showDeviceIcon = false;

  private resizeObserver: SharedResizeObserverInterface = new SharedResizeObserver();

  private changeFontSize(): void {
    const fontSize = `${this.fontSizeSlider.value}rem`;
    this.style.setProperty('--responsive-nav-font-size', fontSize);
    this.fontSizeValue.innerHTML = `${this.fontSizeSlider.value}rem`;
  }

  private changeIconSize(): void {
    const fontSize = `${this.iconSizeSlider.value}rem`;
    this.style.setProperty('--responsive-nav-icon-size', fontSize);
    this.iconSizeValue.innerHTML = `${this.iconSizeSlider.value}rem`;
  }

  private changeItemSpacing(): void {
    const itemSpacing = `${this.itemSpacingSlider.value}px`;
    this.nav.navItemSpacing = parseFloat(this.itemSpacingSlider.value);
    this.itemSpacingValue.innerHTML = itemSpacing;
  }

  private changeMenuGap(): void {
    this.nav.menuGap = parseFloat(this.menuGapSlider.value);
    this.menuGapValue.innerHTML = `${this.menuGapSlider.value}px`;
  }

  private toggleNavOutlines(): void {
    this.showDevOutline = this.showBordersCheck.checked;
  }

  private toggleExtraNavVisibility(): void {
    this.nav.showHiddenItems = this.showNavCheck.checked;
  }

  private changeConstrainedSize(): void {
    const constrainedWidth = `${this.constrainedWidthSlider.value}rem`;
    this.style.setProperty(
      '--responsive-nav-constrained-width',
      constrainedWidth
    );
    this.constrainedWidthValue.innerHTML = constrainedWidth;
  }

  handleResize(entry: ResizeObserverEntry): void {
    const width = entry.contentRect.width;
    let device: Device = Device.iPad;
    if (width < 500) {
      device = Device.iPhone;
    } else if (width < 800) {
      device = Device.iPad;
    } else {
      device = Device.macBook;
    }
    this.device = device;
  }

  firstUpdated(): void {
    this.resizeObserver.addObserver({
      handler: this,
      target: this.nav,
    });
  }

  render(): TemplateResult {
    return html`
      <div
        class="constrained-size-marker ${this.showDevOutline ? '' : 'hidden'}"
      ></div>
      <header>
        <responsive-nav
          id="full-width"
          ?showDevOutline=${this.showDevOutline}
          .resizeObserver=${this.resizeObserver}
        >
        </responsive-nav>
      </header>

      <div class="dev">
        <fieldset>
          <legend>Dev Tools</legend>
          <div class="dev-option">
            <label for="constrained-width-slider">Constrained Size</label>
            <input
              type="range"
              min="30"
              max="250"
              step="0.1"
              value="250"
              id="constrained-width-slider"
              @input=${this.changeConstrainedSize}
            />
            <span id="constrained-width-value">250rem</span>
          </div>
          <div class="dev-option">
            <label for="show-borders-check">Show Borders</label>
            <input
              type="checkbox"
              id="show-borders-check"
              @input=${this.toggleNavOutlines}
            />
          </div>
          <div class="dev-option">
            <label for="show-extra-nav">Show Extra Nav</label>
            <input
              type="checkbox"
              id="show-extra-nav"
              @input=${this.toggleExtraNavVisibility}
            />
          </div>
          <div class="dev-option">
            <label for="show-device-icon">Show Device Icon</label>
            <input
              type="checkbox"
              id="show-device-icon"
              @input=${(e: Event): void => {
        this.showDeviceIcon = (e.target as HTMLInputElement).checked;
      }}
            />
          </div>
          <div class="dev-option">
            <label for="item-spacing-slider">Item Spacing</label>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value="10"
              id="item-spacing-slider"
              @input=${this.changeItemSpacing}
            />
            <span id="item-spacing-value">10px</span>
          </div>
          <div class="dev-option">
            <label for="font-size-slider">Font Size</label>
            <input
              type="range"
              min="1"
              max="2"
              step="0.1"
              value="1.4"
              id="font-size-slider"
              @input=${this.changeFontSize}
            />
            <span id="font-size-value">1.4rem</span>
          </div>
          <div class="dev-option">
            <label for="icon-size-slider">Icon Size</label>
            <input
              type="range"
              min="2"
              max="5"
              step="0.1"
              value="3"
              id="icon-size-slider"
              @input=${this.changeIconSize}
            />
            <span id="icon-size-value">3rem</span>
          </div>
          <div class="dev-option">
            <label for="menu-gap-slider">Menu Gap</label>
            <input
              type="range"
              min="20"
              max="200"
              step="1"
              value="40"
              id="menu-gap-slider"
              @input=${this.changeMenuGap}
            />
            <span id="menu-gap-value">40px</span>
          </div>
        </fieldset>
      </div>

      ${this.showDeviceIcon
        ? html`
            <div>
              <responsive-device .device=${this.device}></responsive-device>
            </div>
          `
        : nothing}
    `;
  }

  static get styles(): CSSResult {
    const constrainedWidth = css`var(--responsive-nav-constrained-width, 250rem)`;

    return css`
      header {
        background-color: #333;
        margin-bottom: 2rem;
      }

      .constrained-size-marker {
        margin: auto;
        width: ${constrainedWidth};
        position: fixed;
        left: 50%;
        transform: translate(-50%);
        height: 100%;
        outline: 1px solid purple;
        z-index: -1;
      }

      .constrained-size-marker.hidden {
        display: none;
      }

      responsive-nav {
        margin: auto;
        max-width: ${constrainedWidth};
      }

      responsive-device {
        width: 10rem;
        height: 10rem;
        margin: auto;
      }

      .restricted-icon {
        max-width: 60rem;
      }

      .restricted-hamburger {
        max-width: 38rem;
      }

      .dev {
        font-size: 1.6rem;
        margin: 2rem;
      }

      .dev fieldset {
        background-color: #ddd;
      }

      .dev fieldset legend {
        background-color: #ccc;
        border: 1px solid #333;
      }

      .dev label {
        display: inline-block;
        width: 15rem;
      }

      .dev .dev-option {
        margin-bottom: 0.5rem;
      }

      .dev .dev-option:last-child {
        margin-bottom: 0;
      }

      .description {
        font-size: 1.4rem;
        margin: 0.5rem;
      }
    `;
  }
}
