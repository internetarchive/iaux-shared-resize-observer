import type {
  SharedResizeObserverInterface,
  SharedResizeObserverResizeHandlerInterface,
} from '../src/shared-resize-observer';

/**
 * This mock can be used for testing the SharedResizeObserver
 *
 * Initialize it with a map of the elements that will be observed
 * and their expected sizes. Also provide a function that will be
 * called when the consumer adds an observer. This will give you the
 * opportunity to wait until it is ready.
 *
 * For example:
 *
 * it('adds a `mobile` class to the component', async () => {
 *   const el: MyComponent = await fixture(html`<my-component></my-component>`) as MyComponent;
 *   const expectedElement = el.shadowRoot?.querySelector('.my-element') as HTMLDivElement;
 *   const expectedSizes = new Map<Element, DOMRectReadOnly>();
 *
 *   // the mock shared resize observer will return the expected size for the element
 *   expectedSizes.set(expectedElement, {
 *     height: 20, width: 150, bottom: 0, left: 0, right: 0, top: 0, x: 0, y: 0, toJSON: () => ({}),
 *   });
 *
 *   // create the MockSharedResizeObserver, assign it and await the addObserverComplete
 *   // callback to resolve
 *   await new Promise<void>(resolve => {
 *     const mockResizeObserver = new MockSharedResizeObserver({
 *       targetSizes: expectedSizes,
 *       addObserverComplete: (): void => {
 *         resolve();
 *       },
 *     });
 *     el.resizeObserver = mockResizeObserver;
 *   });
 *
 *   // wait until the element is updated before testing
 *   await el.updateComplete;
 *
 *   // check if the resize observer caused your component to update
 *   expect(el.classList.contains('mobile')).to.be.true;
 * });
 */
export class MockSharedResizeObserver implements SharedResizeObserverInterface {
  private resizeHandlers: Map<
    Element,
    Set<SharedResizeObserverResizeHandlerInterface>
  > = new Map();

  private targetSizes: Map<Element, DOMRectReadOnly>;

  private addObserverComplete: () => void;

  constructor(options: {
    targetSizes: Map<Element, DOMRectReadOnly>;
    addObserverComplete: () => void;
  }) {
    this.targetSizes = options.targetSizes;
    this.addObserverComplete = options.addObserverComplete;
  }

  addObserver(options: {
    handler: SharedResizeObserverResizeHandlerInterface;
    target: Element;
    options?: ResizeObserverOptions | undefined;
  }): void {
    const handlers = this.resizeHandlers.get(options.target) ?? new Set();
    handlers.add(options.handler);
    this.resizeHandlers.set(options.target, handlers);
    const size = this.targetSizes.get(options.target);
    if (!size) return;
    options.handler.handleResize({
      target: options.target,
      borderBoxSize: [{ blockSize: 0, inlineSize: 0 }],
      contentBoxSize: [{ blockSize: 0, inlineSize: 0 }],
      contentRect: size,
    });
    this.addObserverComplete();
  }

  removeObserver(options: {
    handler: SharedResizeObserverResizeHandlerInterface;
    target: Element;
  }): void {
    const handlers = this.resizeHandlers.get(options.target);
    if (!handlers) return;
    handlers.delete(options.handler);
    if (handlers.size === 0) {
      this.resizeHandlers.delete(options.target);
    }
  }

  shutdown(): void {
    this.resizeHandlers.clear();
  }
}
