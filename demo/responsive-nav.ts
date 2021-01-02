import {
  html,
  css,
  LitElement,
  TemplateResult,
  CSSResult,
  query,
  internalProperty,
  queryAll,
  property,
  customElement,
  PropertyValues,
} from 'lit-element';

import iaIcon from '@internetarchive/icon-ia-logo';
import webIcon from '@internetarchive/icon-web';
import booksIcon from '@internetarchive/icon-texts';
import videoIcon from '@internetarchive/icon-video';
import audioIcon from '@internetarchive/icon-audio';
import softwareIcon from '@internetarchive/icon-software';
import imagesIcon from '@internetarchive/icon-images';
import userIcon from '@internetarchive/icon-user';
import uploadIcon from '@internetarchive/icon-upload';
import donateIcon from '@internetarchive/icon-donate';

import hamburgerIcon from './icons/hamburger';

import './responsive-nav-item';
import { ResponsiveNavItem, ResponsiveItemMode } from './responsive-nav-item';
import {
  SharedResizeObserverInterface,
  SharedResizeObserverResizeHandlerInterface,
} from '../index';
import { nothing } from 'lit-html';

export enum ResponsiveNavSizeClass {
  Full = 'full',
  IconsOnly = 'icons-only',
  Hamburger = 'hamburger',
}

interface MenuOption {
  title: string;
  icon: TemplateResult;
}

@customElement('responsive-nav')
export class ResponsiveNav
  extends LitElement
  implements SharedResizeObserverResizeHandlerInterface {
  @property({ type: Number }) menuGap = 40;

  @property({ type: Boolean }) showHiddenItems = false;

  @property({ type: Boolean }) showDevOutline = false;

  @property({ type: String }) id = `${Math.random()}`;

  @property({ type: Object }) resizeObserver?: SharedResizeObserverInterface;

  @property({ type: Number }) navItemSpacing = 10;

  @internalProperty()
  private sizeClass: ResponsiveNavSizeClass = ResponsiveNavSizeClass.Full;

  @query('ul') navList!: HTMLUListElement;

  @queryAll('responsive-nav-item') navItems!: ResponsiveNavItem[];

  firstUpdated(): void {
    this.setupResizeObserver();
  }

  disconnectedCallback(): void {
    this.disconnectResizeObserver();
  }

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

  handleResize(entry: ResizeObserverEntry): void {
    const cr = entry.contentRect;
    if (cr.width - this.menuGap < this.estimateIconOnlyWidth) {
      this.sizeClass = ResponsiveNavSizeClass.Hamburger;
    } else if (cr.width - this.menuGap < this.estimateFullWidth) {
      this.sizeClass = ResponsiveNavSizeClass.IconsOnly;
    } else {
      this.sizeClass = ResponsiveNavSizeClass.Full;
    }
  }

  private get currentMenuOptions(): Array<MenuOption> {
    return this.showHiddenItems
      ? this.extendedMenuOptions
      : this.baseMenuOptions;
  }

  private get baseMenuOptions(): Array<MenuOption> {
    return [
      {
        title: 'Internet Archive',
        icon: iaIcon,
      },
      {
        title: 'Web',
        icon: webIcon,
      },
      {
        title: 'Books',
        icon: booksIcon,
      },
      {
        title: 'Video',
        icon: videoIcon,
      },
      {
        title: 'Audio',
        icon: audioIcon,
      },
      {
        title: 'Software',
        icon: softwareIcon,
      },
      {
        title: 'Images',
        icon: imagesIcon,
      },
    ];
  }

  private get extendedMenuOptions(): Array<MenuOption> {
    return this.baseMenuOptions.concat([
      {
        title: 'Donate',
        icon: donateIcon,
      },
    ]);
  }

  private disconnectResizeObserver(): void {
    if (!this.shadowRoot) return;
    this.resizeObserver?.removeObserver({
      handler: this,
      target: this.shadowRoot.host,
    });
  }

  private setupResizeObserver(): void {
    if (!this.shadowRoot) return;
    this.resizeObserver?.addObserver({
      handler: this,
      target: this.shadowRoot.host,
    });
  }

  // the estimated full width of both left and right menus
  private get estimateFullWidth(): number {
    let estimatedWidth = 0;
    this.navItems?.forEach(item => {
      estimatedWidth += item.estimatedFullWidth + this.navItemSpacing + 1;
    });
    estimatedWidth -= this.navItemSpacing;
    return estimatedWidth;
  }

  // the estimated icon-only width of both left and right menus
  private get estimateIconOnlyWidth(): number {
    const totalMenuItems = this.currentMenuOptions.length + 2; // the 2 are the right menu items
    return (
      (this.navItems[0].estimatedIconOnlyWidth + this.navItemSpacing + 1) *
      totalMenuItems -
      this.navItemSpacing
    );
  }

  private get itemMode(): ResponsiveItemMode {
    return this.sizeClass === ResponsiveNavSizeClass.Full
      ? ResponsiveItemMode.IconText
      : ResponsiveItemMode.IconOnly;
  }

  render(): TemplateResult {
    return html`
      <div
        id="container"
        class="${this.showDevOutline ? 'show-dev-outlines' : nothing}"
      >
        <ul class="left">
          ${this.sizeClass === ResponsiveNavSizeClass.Hamburger
        ? html`
                <li>
                  <responsive-nav-item
                    .mode=${ResponsiveItemMode.IconOnly}
                    .icon=${hamburgerIcon}
                  >
                  </responsive-nav-item>
                </li>
              `
        : html`
                ${this.currentMenuOptions.map(
          option => html`
                    <li>
                      <responsive-nav-item
                        .mode=${this.itemMode}
                        .icon=${option.icon}
                        text=${option.title}
                      >
                      </responsive-nav-item>
                    </li>
                  `
        )}
              `}
        </ul>
        <div id="dev-visual-spacer" style="width: ${this.menuGap}px"></div>

        <ul class="right">
          <li>
            <responsive-nav-item
              .mode=${this.itemMode}
              .icon=${userIcon}
              text="JasonB-SF"
            >
            </responsive-nav-item>
          </li>
          <li>
            <responsive-nav-item
              .mode=${this.itemMode}
              .icon=${uploadIcon}
              text="Upload"
            >
            </responsive-nav-item>
          </li>
        </ul>
      </div>
    `;
  }

  static get styles(): CSSResult {
    const backgroundColor = css`var(--responsive-nav-background-color, #333)`;
    const navItemSpacing = css`var(--responsive-nav-item-spacing, 10px)`;

    return css`
      :host {
        display: block;
        padding: 1rem 2rem;
        background-color: ${backgroundColor};
        position: relative;
      }

      #dev-visual-spacer {
        display: inline-block;
        height: 10px;
      }

      .show-dev-outlines ul {
        outline: 1px solid cyan;
      }

      .show-dev-outlines #dev-visual-spacer {
        background-color: green;
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

      .right {
        position: absolute;
        right: 2rem;
      }

      .hidden-menu {
        display: none;
      }
    `;
  }
}
