import {
  html,
  css,
  LitElement,
  TemplateResult,
  CSSResult,
  PropertyValues,
  nothing,
} from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

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

import hamburgerIcon from '../icons/hamburger';

import './nav-item';
import './nav-menu';
import type {
  SharedResizeObserverInterface,
  SharedResizeObserverResizeHandlerInterface,
} from '../../index';
import { ResponsiveNavMenuOption } from './models/menu-option';
import { ResponsiveNavMenuMode } from './models/menu-mode';
import { ResponsiveNavMenu } from './nav-menu';

export enum ResponsiveNavLeftMenuMode {
  Full = 'full',
  Hamburger = 'hamburger',
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

  @property({ type: String }) leftMenuMode: ResponsiveNavLeftMenuMode =
    ResponsiveNavLeftMenuMode.Full;

  @property({ type: String }) leftMenuDisplayMode: ResponsiveNavMenuMode =
    ResponsiveNavMenuMode.IconText;

  @property({ type: String }) rightMenuDisplayMode: ResponsiveNavMenuMode =
    ResponsiveNavMenuMode.IconText;

  @query('#main-menu') mainMenu!: ResponsiveNavMenu;

  @query('#hamburger-menu') hamburgerMenu!: ResponsiveNavMenu;

  @query('#right-menu') rightMenu!: ResponsiveNavMenu;

  disconnectedCallback(): void {
    this.disconnectResizeObserver();
  }

  updated(changed: PropertyValues): void {
    if (changed.has('resizeObserver')) {
      this.setupResizeObserver();
    }
  }

  handleResize(entry: ResizeObserverEntry): void {
    const contentRect = entry.contentRect;
    const availableWidth = contentRect.width - this.menuGap;
    const fullTextWidth =
      this.mainMenu.estimateFullWidth + this.rightMenu.estimateFullWidth;
    const leftIconRightText =
      this.mainMenu.estimateIconOnlyWidth + this.rightMenu.estimateFullWidth;
    const iconOnlyWidth =
      this.mainMenu.estimateIconOnlyWidth +
      this.rightMenu.estimateIconOnlyWidth;

    if (availableWidth < iconOnlyWidth) {
      this.leftMenuMode = ResponsiveNavLeftMenuMode.Hamburger;
      this.leftMenuDisplayMode = ResponsiveNavMenuMode.IconOnly;
      this.rightMenuDisplayMode = ResponsiveNavMenuMode.IconOnly;
    } else if (availableWidth < leftIconRightText) {
      this.leftMenuMode = ResponsiveNavLeftMenuMode.Full;
      this.leftMenuDisplayMode = ResponsiveNavMenuMode.IconOnly;
      this.rightMenuDisplayMode = ResponsiveNavMenuMode.IconOnly;
    } else if (availableWidth < fullTextWidth) {
      this.leftMenuMode = ResponsiveNavLeftMenuMode.Full;
      this.leftMenuDisplayMode = ResponsiveNavMenuMode.IconOnly;
      this.rightMenuDisplayMode = ResponsiveNavMenuMode.IconText;
    } else {
      this.leftMenuMode = ResponsiveNavLeftMenuMode.Full;
      this.leftMenuDisplayMode = ResponsiveNavMenuMode.IconText;
      this.rightMenuDisplayMode = ResponsiveNavMenuMode.IconText;
    }
  }

  private get currentLeftMenu(): ResponsiveNavMenu {
    return this.leftMenuMode === ResponsiveNavLeftMenuMode.Full
      ? this.mainMenu
      : this.hamburgerMenu;
  }

  private get currentMenuOptions(): Array<ResponsiveNavMenuOption> {
    return this.showHiddenItems
      ? this.extendedMenuOptions
      : this.baseMenuOptions;
  }

  private get baseMenuOptions(): ResponsiveNavMenuOption[] {
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

  private get extendedMenuOptions(): ResponsiveNavMenuOption[] {
    return this.baseMenuOptions.concat([
      {
        title: 'Donate',
        icon: donateIcon,
      },
    ]);
  }

  private get rightMenuOptions(): ResponsiveNavMenuOption[] {
    return [
      {
        title: 'ArchiveUser',
        icon: userIcon,
      },
      {
        title: 'Upload',
        icon: uploadIcon,
      },
    ];
  }

  private get hamburgerMenuOptions(): ResponsiveNavMenuOption[] {
    return [
      {
        icon: hamburgerIcon,
      },
    ];
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

  private get hamburgerMenuTemplate(): TemplateResult {
    return html`
      <responsive-nav-menu
        id="hamburger-menu"
        .itemMode=${ResponsiveNavMenuMode.IconOnly}
        .navItemSpacing=${this.navItemSpacing}
        .menuOptions=${this.hamburgerMenuOptions}
      ></responsive-nav-menu>
    `;
  }

  private get mainLeftMenuTemplate(): TemplateResult {
    return html`
      <responsive-nav-menu
        id="main-menu"
        .navItemSpacing=${this.navItemSpacing}
        .menuOptions=${this.currentMenuOptions}
        .itemMode=${this.leftMenuDisplayMode}
      ></responsive-nav-menu>
    `;
  }

  private get rightMenuTemplate(): TemplateResult {
    return html`
      <responsive-nav-menu
        id="right-menu"
        class="right"
        .navItemSpacing=${this.navItemSpacing}
        .menuOptions=${this.rightMenuOptions}
        itemMode=${this.rightMenuDisplayMode}
      ></responsive-nav-menu>
    `;
  }

  render(): TemplateResult {
    return html`
      <div
        id="container"
        class="${this.showDevOutline ? 'show-dev-outlines' : nothing}"
      >
        <div
          class="left-menu ${this.leftMenuMode ===
          ResponsiveNavLeftMenuMode.Hamburger
            ? 'hamburger'
            : 'full'}"
        >
          ${this.hamburgerMenuTemplate} ${this.mainLeftMenuTemplate}
        </div>

        <div id="dev-visual-spacer" style="width: ${this.menuGap}px"></div>

        ${this.rightMenuTemplate}
      </div>
    `;
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
        padding: 1rem 2rem;
        position: relative;
      }

      #dev-visual-spacer {
        display: inline-block;
        height: 10px;
      }

      .show-dev-outlines responsive-nav-menu {
        outline: 1px solid cyan;
      }

      .show-dev-outlines #dev-visual-spacer {
        background-color: green;
      }

      .left-menu {
        display: inline-block;
      }

      .left-menu.full #hamburger-menu {
        position: absolute;
        left: -10000px;
        visibility: hidden;
      }

      .left-menu.hamburger #main-menu {
        position: absolute;
        left: -10000px;
        visibility: hidden;
      }

      .right {
        position: absolute;
        right: 2rem;
      }
    `;
  }
}
