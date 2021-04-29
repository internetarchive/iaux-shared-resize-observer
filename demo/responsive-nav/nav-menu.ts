import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  property,
  PropertyValues,
  queryAll,
  TemplateResult,
} from 'lit-element';
import { ResponsiveNavMenuMode } from './models/menu-mode';
import { ResponsiveNavMenuOption } from './models/menu-option';
import { ResponsiveNavItem } from './nav-item';

@customElement('responsive-nav-menu')
export class ResponsiveNavMenu extends LitElement {
  @property({ type: Array })
  menuOptions: ResponsiveNavMenuOption[] = [];

  @property({ type: String })
  itemMode: ResponsiveNavMenuMode = ResponsiveNavMenuMode.IconText;

  @queryAll('responsive-nav-item') navItems!: ResponsiveNavItem[];

  @property({ type: Number }) navItemSpacing = 10;

  updated(changed: PropertyValues): void {
    if (changed.has('navItemSpacing')) {
      // this keeps our JS and CSS in sync so the JS can calculate the width
      // for changing modes and the CSS spaces properly
      this.style.setProperty(
        '--responsive-nav-item-spacing',
        `${this.navItemSpacing}px`
      );
    }
  }

  render(): TemplateResult {
    return html`
      <ul>
        ${this.menuOptions.map(
          option => html`
            <li>
              <responsive-nav-item
                .mode=${this.itemMode}
                .icon=${option.icon}
                .text=${option.title}
              >
              </responsive-nav-item>
            </li>
          `
        )}
      </ul>
    `;
  }

  // the estimated full width
  get estimateFullWidth(): number {
    let estimatedWidth = 0;
    this.navItems.forEach(item => {
      estimatedWidth += item.estimatedFullWidth + this.navItemSpacing + 2;
    });
    estimatedWidth -= this.navItemSpacing;
    return estimatedWidth;
  }

  // the estimated icon-only width
  get estimateIconOnlyWidth(): number {
    const totalMenuItems = this.navItems.length;
    return (
      (this.navItems[0].estimatedIconOnlyWidth + this.navItemSpacing + 2) *
        totalMenuItems -
      this.navItemSpacing
    );
  }

  static get styles(): CSSResult {
    const navItemSpacing = css`var(--responsive-nav-item-spacing, 10px)`;

    return css`
      :host {
        display: inline-block;
      }

      ul {
        display: inline-block;
        margin: 0;
        padding: 0;
      }

      li {
        display: inline-block;
        margin-right: ${navItemSpacing};
        padding: 0;
      }

      li:last-child {
        margin-right: 0;
      }
    `;
  }
}
