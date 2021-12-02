import { expect } from '@open-wc/testing';
import {
  SharedResizeObserver,
  SharedResizeObserverResizeHandlerInterface,
} from '../src/shared-resize-observer';
import { promisedSleep } from './promised-sleep';

describe('Shared Resize Observer', () => {
  let el: HTMLElement;

  beforeEach((done): void => {
    el = document.createElement('div');
    el.style.width = '100px';
    el.style.height = '100px';
    document.body.appendChild(el);
    // Make sure it's a clean frame to run the test on
    requestAnimationFrame((): void => done());
  });

  afterEach((): void => {
    while (document.body.firstElementChild) {
      document.body.removeChild(document.body.firstElementChild);
    }
  });

  it('dispatches a handleResize event to handlers', async () => {
    let handleResizeCalled = false;
    let x = -1;
    let y = -1;
    let width = -1;
    let right = -1;

    class MockHandler implements SharedResizeObserverResizeHandlerInterface {
      handleResize(entry: ResizeObserverEntry): void {
        x = entry.contentRect.x;
        y = entry.contentRect.y;
        width = entry.contentRect.width;
        right = entry.contentRect.right;
        handleResizeCalled = true;
      }
    }

    const mockHandler = new MockHandler();
    const resizeObserver = new SharedResizeObserver();
    resizeObserver.addObserver({
      handler: mockHandler,
      target: el,
    });
    // since the dispatch is asynchronous, we need to wait for it to be called
    // it should be really fast, though
    await promisedSleep(100);

    expect(handleResizeCalled).to.be.true;
    expect(x).to.equal(0);
    expect(y).to.equal(0);
    expect(width).to.equal(100);
    expect(right).to.equal(100);
  });

  it('dispatches handleResize events to multiple handlers', async () => {
    let handler1ResizeCalled = false;
    let handler2ResizeCalled = false;

    class MockHandler1 implements SharedResizeObserverResizeHandlerInterface {
      handleResize(): void {
        handler1ResizeCalled = true;
      }
    }

    class MockHandler2 implements SharedResizeObserverResizeHandlerInterface {
      handleResize(): void {
        handler2ResizeCalled = true;
      }
    }

    const mockHandler1 = new MockHandler1();
    const mockHandler2 = new MockHandler2();

    const resizeObserver = new SharedResizeObserver();
    resizeObserver.addObserver({
      handler: mockHandler1,
      target: el,
    });
    resizeObserver.addObserver({
      handler: mockHandler2,
      target: el,
    });

    // since the dispatch is asynchronous, we need to wait for it to be called
    // it should be really fast, though
    await promisedSleep(100);

    expect(handler1ResizeCalled).to.be.true;
    expect(handler2ResizeCalled).to.be.true;
  });

  it('can remove a handler', async () => {
    let handleResizeCallCount = 0;
    class MockHandler implements SharedResizeObserverResizeHandlerInterface {
      handleResize(): void {
        handleResizeCallCount++;
      }
    }

    const mockHandler = new MockHandler();

    const resizeObserver = new SharedResizeObserver();
    resizeObserver.addObserver({
      handler: mockHandler,
      target: el,
    });
    await promisedSleep(100);
    expect(handleResizeCallCount).to.equal(1);
    // trigger a handleResize event
    el.style.width = '50px';
    await promisedSleep(100);
    expect(handleResizeCallCount).to.equal(2);

    resizeObserver.removeObserver({
      handler: mockHandler,
      target: el,
    });
    // trigger another handleResize, but this one won't trigger a resize event
    el.style.width = '75px';
    await promisedSleep(100);
    expect(handleResizeCallCount).to.equal(2);
  });

  it('just returns if you try to remove a handler that does not exist', async () => {
    let handleResizeCallCount = 0;
    class MockHandler implements SharedResizeObserverResizeHandlerInterface {
      handleResize(): void {
        handleResizeCallCount++;
      }
    }
    const mockHandler = new MockHandler();
    const resizeObserver = new SharedResizeObserver();
    resizeObserver.removeObserver({
      handler: mockHandler,
      target: el,
    });
    // trigger another handleResize, there are no listeners so the count will be 0
    el.style.width = '75px';
    await promisedSleep(100);
    expect(handleResizeCallCount).to.equal(0);
  });

  it('prevents adding a handler twice', async () => {
    let handleResizeCallCount = 0;
    class MockHandler implements SharedResizeObserverResizeHandlerInterface {
      handleResize(): void {
        handleResizeCallCount++;
      }
    }

    const mockHandler = new MockHandler();

    const resizeObserver = new SharedResizeObserver();
    resizeObserver.addObserver({
      handler: mockHandler,
      target: el,
    });
    await promisedSleep(100);
    expect(handleResizeCallCount).to.equal(1);

    // add the same observer again shouldn't trigger another event
    resizeObserver.addObserver({
      handler: mockHandler,
      target: el,
    });
    await promisedSleep(100);
    expect(handleResizeCallCount).to.equal(1);

    el.style.width = '50px';
    await promisedSleep(100);
    expect(handleResizeCallCount).to.equal(2);
  });

  it('can be shutdown', async () => {
    let handleResizeCallCount = 0;
    class MockHandler implements SharedResizeObserverResizeHandlerInterface {
      handleResize(): void {
        handleResizeCallCount++;
      }
    }

    const mockHandler = new MockHandler();

    const resizeObserver = new SharedResizeObserver();
    resizeObserver.addObserver({
      handler: mockHandler,
      target: el,
    });
    await promisedSleep(100);
    expect(handleResizeCallCount).to.equal(1);
    el.style.width = '50px';
    await promisedSleep(100);
    expect(handleResizeCallCount).to.equal(2);
    resizeObserver.shutdown();

    // verify our observer got disconnected
    el.style.width = '75px';
    await promisedSleep(100);
    expect(handleResizeCallCount).to.equal(2);
  });

  it('only unobserves the element once all handlers are removed', async () => {
    let handleResizeCallCount = 0;
    class MockHandler implements SharedResizeObserverResizeHandlerInterface {
      handleResize(): void {
        handleResizeCallCount++;
      }
    }

    const mockHandler = new MockHandler();
    const mockHandler2 = new MockHandler();

    // add two handlers to the same target
    const resizeObserver = new SharedResizeObserver();
    resizeObserver.addObserver({
      handler: mockHandler,
      target: el,
    });
    resizeObserver.addObserver({
      handler: mockHandler2,
      target: el,
    });
    await promisedSleep(100);
    expect(handleResizeCallCount).to.equal(2);

    // remove one handler
    resizeObserver.removeObserver({
      handler: mockHandler,
      target: el,
    });
    await promisedSleep(100);

    // trigger a resize and our other handler should still be called
    el.style.width = '50px';
    await promisedSleep(100);
    expect(handleResizeCallCount).to.equal(3);
  });
});
