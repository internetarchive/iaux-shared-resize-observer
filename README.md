# SharedResizeObserver

The `SharedResizeObserver` is an thin layer over the `ResizeObserver` to allow for WebComponents and other observers to use a single, shared `ResizeObserver` to provide performant resize observation.

It's more efficient to run a single `ResizeObserver` with many observations than many `ResizeObservers`, as noted in [this performance comparison](https://groups.google.com/a/chromium.org/g/blink-dev/c/z6ienONUb5A/m/F5-VcUZtBAAJ). A singleton of the `SharedResizeObserver` can be shared with any element that needs resize observation. Consumers register themselves with `resizeObserver.addObserver({ handler, target })` and get a `handleResize(entry: ResizeObserverEntry)` callback when the target changes. See `Usage` section below for an example.

## Installation
```bash
npm i @internetarchive/shared-resize-observer
```

## Usage
```ts
import { SharedResizeObserver } from '@internetarchive/shared-resize-observer';
import type {
  ResizeObserverInterface,
  SharedResizeObserverResizeHandlerInterface
} from '@internetarchive/shared-resize-observer';

@customElement('app-root')
export class AppRoot extends LitElement {
  private resizeObserver: SharedResizeObserverInterface = new SharedResizeObserver();

  render() {
    return html`
      <some-responsive-component
        .resizeObserver=${this.resizeObserver}>
      </some-responsive-component>

      <other-responsive-component
        .resizeObserver=${this.resizeObserver}>
      </other-responsive-component>
    `;
  }
}

@customElement('some-responsive-component')
export class SomeResponsiveComponent extends LitElement
  implements SharedResizeObserverResizeHandlerInterface {
  @property({ type: Object })
  resizeObserver?: SharedResizeObserverInterface;

  updated(changed: PropertyValues): void {
    // when we get a resizeObserver, set it up
    if (changed.has('resizeObserver')) {
      this.setupResizeObserver();
    }
  }

  // when the component is disconnected, disconnect the resize observer
  disconnectedCallback(): void {
    this.disconnectResizeObserver();
  }

  // handle the resize event
  handleResize(entry: ResizeObserverEntry): void {
    // if you are observing multiple targets,
    // you can distinguish them through `entry.target`
    const target = entry.target;
    if (target !== this.shadowRoot.host) return;

    const contentRect = entry.contentRect;
    // configure your view, ie:
    if (contentRect.width < 600) {
      // do something when component viewport is less than 600px wide
    } else {
      // do something when component viewport is 600px or more wide
    }
  }

  // remove this component as an observer when disconnected
  private disconnectResizeObserver(): void {
    if (!this.shadowRoot) return;
    this.resizeObserver?.removeObserver({
      handler: this,
      target: this.shadowRoot.host,
    });
  }

  // observe the shadowRoot's viewport and
  // make this component the handler of changes
  private setupResizeObserver(): void {
    this.disconnectResizeObserver();
    if (!this.shadowRoot) return;
    this.resizeObserver?.addObserver({
      handler: this,
      target: this.shadowRoot.host,
    });
  }
}
```

Run `npm run start` for a full example and look in the `demo` directory for the sample code. See the docs in the `docs` directory.

## Linting with ESLint, Prettier, and Types
To scan the project for linting errors, run
```bash
npm run lint
```

You can lint with ESLint and Prettier individually as well
```bash
npm run lint:eslint
```
```bash
npm run lint:prettier
```

To automatically fix many linting errors, run
```bash
npm run format
```

You can format using ESLint and Prettier individually as well
```bash
npm run format:eslint
```
```bash
npm run format:prettier
```

## Testing with Web Test Runner
To run the suite of Web Test Runner tests, run
```bash
npm run test
```

To run the tests in watch mode (for <abbr title="test driven development">TDD</abbr>, for example), run

```bash
npm run test:watch
```


## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.

## Local Demo with `web-dev-server`
```bash
npm start
```
To run a local development server that serves the basic demo located in `demo/index.html`
