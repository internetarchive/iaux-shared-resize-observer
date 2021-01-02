import { html, fixture, expect } from '@open-wc/testing';

import { SharedResizeObserver } from '../src/SharedResizeObserver.js';
import '../shared-resize-observer.js';

describe('SharedResizeObserver', () => {
  it('has a default title "Hey there" and counter 5', async () => {
    const el = await fixture<SharedResizeObserver>(html`<shared-resize-observer></shared-resize-observer>`);

    expect(el.title).to.equal('Hey there');
    expect(el.counter).to.equal(5);
  });

  it('increases the counter on button click', async () => {
    const el = await fixture<SharedResizeObserver>(html`<shared-resize-observer></shared-resize-observer>`);
    el.shadowRoot!.querySelector('button')!.click();

    expect(el.counter).to.equal(6);
  });

  it('can override the title via attribute', async () => {
    const el = await fixture<SharedResizeObserver>(html`<shared-resize-observer title="attribute title"></shared-resize-observer>`);

    expect(el.title).to.equal('attribute title');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<SharedResizeObserver>(html`<shared-resize-observer></shared-resize-observer>`);

    await expect(el).shadowDom.to.be.accessible();
  });
});
