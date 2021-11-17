import { css, CSSResult, html, LitElement, TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

@customElement('dev-slider')
export class DevSlider extends LitElement {
  @property()
  label?: string;

  @property()
  unit = 'px';

  @property({ type: Number })
  min = 0;

  @property({ type: Number })
  max = 100;

  @property({ type: Number })
  step = 1;

  @property({ type: Number })
  value = 1;

  @query('#slider') slider!: HTMLInputElement;

  private valueChanged(): void {
    this.value = parseFloat(this.slider.value);
    const event = new CustomEvent('valueChanged', {
      detail: {
        value: this.value,
      },
    });
    this.dispatchEvent(event);
  }

  private get displayValue(): string {
    return `${this.value}${this.unit}`;
  }

  render(): TemplateResult {
    return html`
      <label for="slider">${this.label}</label>
      <input
        type="range"
        min=${this.min}
        max=${this.max}
        step=${this.step}
        value=${this.value}
        id="slider"
        @input=${this.valueChanged}
      />
      <span id="value">${this.displayValue}</span>
    `;
  }

  static get styles(): CSSResult {
    const labelWidth = css`var(--dev-label-width, 15rem)`;
    const sliderWidth = css`var(--dev-slider-width, 25rem)`;

    return css`
      label {
        display: inline-block;
        width: ${labelWidth};
      }

      input[type='range'] {
        width: ${sliderWidth};
      }
    `;
  }
}
