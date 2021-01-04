import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  property,
  TemplateResult,
} from 'lit-element';

import ipadIcon from './icons/ipad';
import iphoneIcon from './icons/iphone';
import macbookIcon from './icons/macbook';

export enum Device {
  iPad = 'ipad',
  iPhone = 'iphone',
  macBook = 'macbook',
}

@customElement('responsive-device')
export class ResponsiveDevice extends LitElement {
  @property()
  device: Device = Device.iPhone;

  render(): TemplateResult {
    return html` ${this.deviceIcon} `;
  }

  private get deviceIcon(): TemplateResult {
    switch (this.device) {
      case Device.iPad:
        return ipadIcon;
      case Device.iPhone:
        return iphoneIcon;
      case Device.macBook:
        return macbookIcon;
    }
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
        background-color: #999;
        border-radius: 50%;
        padding: 2rem;
      }

      svg {
        width: 100%;
        height: 100%;
      }
    `;
  }
}
