import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  query,
  TemplateResult,
} from 'lit-element';
import './responsive-nav';
import { ResponsiveNav } from './responsive-nav';
import {
  SharedResizeObserver,
  SharedResizeObserverInterface,
} from '../src/shared-resize-observer';

@customElement('app-root')
export class AppRoot extends LitElement {
  @query('#show-borders-check') showBordersCheck!: HTMLInputElement;
  @query('#show-extra-nav') showNavCheck!: HTMLInputElement;
  @query('#item-spacing-slider') itemSpacingSlider!: HTMLInputElement;
  @query('#item-spacing-value') itemSpacingValue!: HTMLSpanElement;
  @query('#font-size-slider') fontSizeSlider!: HTMLInputElement;
  @query('#font-size-value') fontSizeValue!: HTMLSpanElement;
  @query('#icon-size-slider') iconSizeSlider!: HTMLInputElement;
  @query('#icon-size-value') iconSizeValue!: HTMLSpanElement;
  @query('#menu-gap-slider') menuGapSlider!: HTMLInputElement;
  @query('#menu-gap-value') menuGapValue!: HTMLSpanElement;

  @query('#full-width') fullWidthNav!: ResponsiveNav;
  @query('#med-width') medWidthNav!: ResponsiveNav;
  @query('#compact-width') compactWidthNav!: ResponsiveNav;

  private get navs(): ResponsiveNav[] {
    return [this.fullWidthNav, this.medWidthNav, this.compactWidthNav];
  }

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
    this.navs.forEach(nav => {
      nav.navItemSpacing = parseFloat(this.itemSpacingSlider.value);
    });
    this.itemSpacingValue.innerHTML = itemSpacing;
  }

  private changeMenuGap(): void {
    this.navs.forEach(nav => {
      nav.menuGap = parseFloat(this.menuGapSlider.value);
    });
    this.menuGapValue.innerHTML = `${this.menuGapSlider.value}px`;
  }

  private toggleNavOutlines(): void {
    this.navs.forEach(nav => {
      nav.showDevOutline = this.showBordersCheck.checked;
    });
  }

  private toggleExtraNavVisibility(): void {
    this.navs.forEach(nav => {
      nav.showHiddenItems = this.showNavCheck.checked;
    });
  }

  render(): TemplateResult {
    return html`
      <div class="example full">
        <responsive-nav id="full-width" .resizeObserver=${this.resizeObserver}>
        </responsive-nav>
        <div class="description">Full Width</div>
      </div>
      <div class="example restricted-icon">
        <responsive-nav id="med-width" .resizeObserver=${this.resizeObserver}>
        </responsive-nav>
        <div class="description">Max Width 60rem</div>
      </div>
      <div class="example restricted-hamburger">
        <responsive-nav
          id="compact-width"
          .resizeObserver=${this.resizeObserver}
        >
        </responsive-nav>
        <div class="description">Max Width 38rem</div>
      </div>
      <div class="description">
        Three examples of the same responsive nav component using the same SharedResizeObserver.
      </div>
      <div class="dev">
        <fieldset>
          <legend>Dev Tools</legend>
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
    `;
  }

  static get styles(): CSSResult {
    return css`
      .example {
        margin-bottom: 2rem;
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
