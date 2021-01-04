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
import './dev/dev-checkbox';
import './dev/dev-slider';

@customElement('app-root')
export class AppRoot
  extends LitElement
  implements SharedResizeObserverResizeHandlerInterface {
  @query('responsive-nav') nav!: ResponsiveNav;

  @internalProperty()
  private device: Device = Device.macBook;

  @internalProperty()
  private showDevOutline = false;

  @internalProperty()
  private showDeviceIcon = false;

  private resizeObserver: SharedResizeObserverInterface = new SharedResizeObserver();

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
            <dev-slider
              label="Max Width"
              min="30"
              max="250"
              step="0.1"
              value="250"
              unit="rem"
              @valueChanged=${(e: CustomEvent): void => {
        const constrainedWidth = `${e.detail.value}rem`;
        this.style.setProperty(
          '--responsive-nav-constrained-width',
          constrainedWidth
        );
      }}
            ></dev-slider>
          </div>
          <div class="dev-option">
            <dev-checkbox
              label="Show Borders"
              @valueChanged=${(e: CustomEvent): void => {
        this.showDevOutline = e.detail.checked;
      }}
            ></dev-checkbox>
          </div>
          <div class="dev-option">
            <dev-checkbox
              label="Show Donate Nav"
              @valueChanged=${(e: CustomEvent): void => {
        this.nav.showHiddenItems = e.detail.checked;
              }}
            ></dev-checkbox>
          </div>
          <div class="dev-option">
            <dev-slider
              label="Item Spacing"
              min="1"
              max="30"
              step="1"
              value="10"
              unit="px"
              @valueChanged=${(e: CustomEvent): void => {
        this.nav.navItemSpacing = e.detail.value;
      }}
            ></dev-slider>
          </div>
          <div class="dev-option">
            <dev-slider
              label="Font Size"
              min="1"
              max="2"
              step="0.1"
              value="1.4"
              unit="rem"
              @valueChanged=${(e: CustomEvent): void => {
        const fontSize = `${e.detail.value}rem`;
        this.style.setProperty('--responsive-nav-font-size', fontSize);
      }}
            ></dev-slider>
          </div>
          <div class="dev-option">
            <dev-slider
              label="Icon Size"
              min="2"
              max="5"
              step="0.1"
              value="3"
              unit="rem"
              @valueChanged=${(e: CustomEvent): void => {
        const fontSize = `${e.detail.value}rem`;
        this.style.setProperty('--responsive-nav-icon-size', fontSize);
      }}
            ></dev-slider>
          </div>
          <div class="dev-option">
            <dev-slider
              label="Menu Gap"
              min="20"
              max="200"
              step="1"
              value="40"
              unit="px"
              @valueChanged=${(e: CustomEvent): void => {
        this.nav.menuGap = e.detail.value;
      }}
            ></dev-slider>
          </div>
          <div class="dev-option">
            <dev-checkbox
              label="Show Device Icon"
              @valueChanged=${(e: CustomEvent): void => {
        this.showDeviceIcon = e.detail.checked;
      }}
            ></dev-checkbox>
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

      .description {
        font-size: 1.4rem;
        margin: 0.5rem;
      }
    `;
  }
}
