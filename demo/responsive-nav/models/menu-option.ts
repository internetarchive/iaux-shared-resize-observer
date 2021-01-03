import { TemplateResult } from 'lit-html';

export class ResponsiveNavMenuOption {
  title?: string;
  icon?: TemplateResult;

  constructor(options: { title?: string; icon?: TemplateResult }) {
    this.title = options.title;
    this.icon = options.icon;
  }
}
