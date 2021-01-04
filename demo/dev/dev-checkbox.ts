import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  property,
  query,
  TemplateResult,
} from 'lit-element';

@customElement('dev-checkbox')
export class DevCheckbox extends LitElement {
  @property()
  label?: string;

  @query('input[type=checkbox]') checkbox!: HTMLInputElement;

  private checkboxToggled(): void {
    const event = new CustomEvent('valueChanged', {
      detail: {
        checked: this.checkbox.checked,
      },
    });
    this.dispatchEvent(event);
  }

  render(): TemplateResult {
    return html`
      <label for="dev-check">${this.label}</label>
      <input type="checkbox" id="dev-check" @input=${this.checkboxToggled} />
    `;
  }

  static get styles(): CSSResult {
    const labelWidth = css`var(--dev-label-width, 15rem)`;

    return css`
      label {
        display: inline-block;
        width: ${labelWidth};
      }
    `;
  }
}
