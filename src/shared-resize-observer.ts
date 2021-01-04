/**
 * An interface for objects to handle resize events for a target
 */
export interface SharedResizeObserverResizeHandler {
  handleResize(entry: ResizeObserverEntry): void;
}

export interface SharedResizeObserverInterface {
  /**
   * Add an observer to the ResizeObserver
   *
   * @param options
   */
  addObserver(options: {
    handler: SharedResizeObserverResizeHandler;
    target: Element;
    options?: ResizeObserverOptions | undefined;
  }): void;

  /**
   * Remove an observer from the ResizeObserver
   *
   * @param options
   */
  removeObserver(options: {
    handler: SharedResizeObserverResizeHandler;
    target: Element;
  }): void;
}

/**
 * The SharedResizeObserver provides a ResizeObserver that can be
 * shared amongst many elements and handlers.
 *
 * It's more efficient to run a single ResizeObserver with many
 * observations than many ResizeObservers. A singleton of
 * the SharedResizeObserver can be passed down through any element
 * that needs resize observation and get a `handleResize()` callback
 */
export class SharedResizeObserver implements SharedResizeObserverInterface {
  /** @inheritdoc */
  addObserver(options: {
    handler: SharedResizeObserverResizeHandler;
    target: Element;
    options?: ResizeObserverOptions | undefined;
  }): void {
    const handlers = this.resizeHandlers.get(options.target) ?? new Set();
    if (!handlers) return;
    handlers.add(options.handler);
    this.resizeHandlers.set(options.target, handlers);
    this.resizeObserver.observe(options.target, options.options);
  }

  /** @inheritdoc */
  removeObserver(options: {
    handler: SharedResizeObserverResizeHandler;
    target: Element;
  }): void {
    const handlers = this.resizeHandlers.get(options.target);
    if (!handlers) return;
    this.resizeObserver.unobserve(options.target);
    handlers.delete(options.handler);
    if (handlers.size === 0) {
      this.resizeHandlers.delete(options.target);
    }
  }

  private resizeObserver: ResizeObserver;

  /**
   * A map of all of the observed elements and their resize handlers
   *
   * @private
   * @type {Map<
   *     Element,
   *     Set<SharedResizeObserverResizeHandler>
   *   >}
   * @memberof SharedResizeObserver
   */
  private resizeHandlers: Map<
    Element,
    Set<SharedResizeObserverResizeHandler>
  > = new Map();

  constructor() {
    this.resizeObserver = new ResizeObserver(entries => {
      // This requestAnimationFrame is to slow down the refresh rate, otherwise you get a bunch
      // of `ResizeObserver loop completed with undelivered notifications` errors
      // The errors are not harmful, but they happen a lot, see:
      // https://stackoverflow.com/a/58701523
      // https://github.com/souporserious/react-measure/issues/104
      // https://github.com/WICG/resize-observer/issues/38
      window.requestAnimationFrame(() => {
        for (const entry of entries) {
          const handlers = this.resizeHandlers.get(entry.target);
          handlers?.forEach(handler => {
            handler.handleResize(entry);
          });
        }
      });
    });
  }
}
