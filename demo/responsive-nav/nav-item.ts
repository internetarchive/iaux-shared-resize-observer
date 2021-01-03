import {
  html,
  css,
  LitElement,
  TemplateResult,
  CSSResult,
  property,
  customElement,
  query,
} from 'lit-element';
import { ResponsiveNavMenuMode } from './models/menu-mode';

@customElement('responsive-nav-item')
export class ResponsiveNavItem extends LitElement {
  @property({ type: String }) mode: ResponsiveNavMenuMode =
    ResponsiveNavMenuMode.IconText;

  @property({ type: Object }) icon?: TemplateResult;

  @property({ type: String }) text?: string;

  @query('.icon') iconContainer!: HTMLSpanElement;

  @query('.text') textContainer!: HTMLSpanElement;

  // This is a special element that stays visible but offscreen
  // to estimate the full width of this element for sizing
  // This is needed because the element width becomes 0 when you hide it
  // so you can't calculate the proper width
  @query('.text.size-estimator') textSizeEstimatorContainer!: HTMLSpanElement;
  @query('.icon.size-estimator') iconSizeEstimatorContainer!: HTMLSpanElement;

  get estimatedFullWidth(): number {
    return (
      this.iconSizeEstimatorContainer.clientWidth +
      this.textSizeEstimatorContainer.clientWidth
    );
  }

  get estimatedIconOnlyWidth(): number {
    return this.iconSizeEstimatorContainer.clientWidth;
  }

  render(): TemplateResult {
    return html`
      <div class="${this.mode} container">
        <span class="icon">${this.icon}</span>
        <span class="text">${this.text}</span>
      </div>
      <span class="icon size-estimator">${this.icon}</span>
      <span class="text size-estimator">${this.text}</span>
    `;
  }

  static get styles(): CSSResult {
    const colorCss = css`var(--responsive-nav-text-color, #ccc)`;
    const hoverCss = css`var(--responsive-nav-text-color, #eee)`;
    const iconSizeCss = css`var(--responsive-nav-icon-size, 3rem)`;
    const fontSizeCss = css`var(--responsive-nav-font-size, 1.4rem)`;

    return css`
      .container {
        display: flex;
        align-items: center;
        cursor: pointer;
      }

      .text {
        color: ${colorCss};
        font-size: ${fontSizeCss};
      }

      .container:hover .text {
        color: ${hoverCss};
      }

      svg {
        width: ${iconSizeCss};
        height: ${iconSizeCss};
      }

      svg .fill-color {
        fill: ${colorCss};
      }

      .container:hover svg .fill-color {
        fill: ${hoverCss};
      }

      .container.icon-only .text {
        display: none;
      }

      .size-estimator {
        position: absolute;
        left: -10000px;
        visibility: hidden;
      }
    `;
  }
}
