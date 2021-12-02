/**
 * An interface for objects to handle resize events for a target
 */
export interface SharedResizeObserverResizeHandlerInterface {
  handleResize(entry: ResizeObserverEntry): void;
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
export interface SharedResizeObserverInterface {
  /**
   * Add an observer to the ResizeObserver.
   *
   * Note that this prevents double-observing so the same handler can be added
   * to the same element multiple times and you will only get a single callback.
   *
   * @param {({
   *     handler: SharedResizeObserverResizeHandlerInterface;
   *     target: Element;
   *     options?: ResizeObserverOptions | undefined;
   *   })} options
   * @memberof SharedResizeObserverInterface
   */
  addObserver(options: {
    handler: SharedResizeObserverResizeHandlerInterface;
    target: Element;
    options?: ResizeObserverOptions | undefined;
  }): void;

  /**
   * Remove an observer from the ResizeObserver
   *
   * @param {{
   *     handler: SharedResizeObserverResizeHandlerInterface;
   *     target: Element;
   *   }} options
   * @memberof SharedResizeObserverInterface
   */
  removeObserver(options: {
    handler: SharedResizeObserverResizeHandlerInterface;
    target: Element;
  }): void;

  /**
   * Remove all observers from the SharedResizeObserver
   */
  shutdown(): void;
}

/** @inheritdoc */
export class SharedResizeObserver implements SharedResizeObserverInterface {
  /** @inheritdoc */
  shutdown(): void {
    this.resizeHandlers.forEach((handlers, target) => {
      this.resizeObserver.unobserve(target);
    });
    this.resizeHandlers.clear();
  }

  /** @inheritdoc */
  addObserver(options: {
    handler: SharedResizeObserverResizeHandlerInterface;
    target: Element;
    options?: ResizeObserverOptions | undefined;
  }): void {
    const handlers = this.resizeHandlers.get(options.target) ?? new Set();
    handlers.add(options.handler);
    this.resizeHandlers.set(options.target, handlers);
    this.resizeObserver.observe(options.target, options.options);
  }

  /** @inheritdoc */
  removeObserver(options: {
    handler: SharedResizeObserverResizeHandlerInterface;
    target: Element;
  }): void {
    const handlers = this.resizeHandlers.get(options.target);
    if (!handlers) return;
    handlers.delete(options.handler);
    if (handlers.size === 0) {
      this.resizeObserver.unobserve(options.target);
      this.resizeHandlers.delete(options.target);
    }
  }

  /**
   * This is the ResizeObserver that dispatches
   * callbacks to all of the handlers.
   *
   * @private
   * @memberof SharedResizeObserver
   */
  private resizeObserver = new ResizeObserver(entries => {
    // This requestAnimationFrame is to throttle the refresh rate,
    // otherwise you get a bunch of
    // `ResizeObserver loop completed with undelivered notifications` errors
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

  /**
   * A map of all of the observed elements and their resize handlers
   *
   * @private
   * @type {Map<
   *     Element,
   *     Set<SharedResizeObserverResizeHandlerInterface>
   *   >}
   * @memberof SharedResizeObserver
   */
  private resizeHandlers: Map<
    Element,
    Set<SharedResizeObserverResizeHandlerInterface>
  > = new Map();
}
