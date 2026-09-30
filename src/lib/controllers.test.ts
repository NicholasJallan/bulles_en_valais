import { describe, expect, it, vi } from 'vitest';
import { mountControllers, type ControllerRegistry } from './controllers.ts';

// The environment is node: elements and root are minimal fakes.
function element(controller?: string): HTMLElement {
  return { dataset: controller === undefined ? {} : { controller } } as unknown as HTMLElement;
}

function root(...elements: HTMLElement[]): ParentNode {
  return { querySelectorAll: vi.fn(() => elements) } as unknown as ParentNode;
}

function spyController() {
  return { init: vi.fn((_element: HTMLElement) => vi.fn()) };
}

describe('mountControllers', () => {
  it('looks for the elements that declare a controller', async () => {
    const container = root();
    await mountControllers(container, {}, vi.fn());
    expect(container.querySelectorAll).toHaveBeenCalledWith('[data-controller]');
  });

  it('initialises each declared controller with its element', async () => {
    const tabs = spyController();
    const faq = spyController();
    const first = element('tabs');
    const second = element('faq');
    const report = vi.fn();
    await mountControllers(
      root(first, second),
      { tabs: async () => tabs, faq: async () => faq },
      report,
    );
    expect(tabs.init).toHaveBeenCalledWith(first);
    expect(faq.init).toHaveBeenCalledWith(second);
    expect(report).not.toHaveBeenCalled();
  });

  it('accepts several whitespace-separated controllers, and none', async () => {
    const tabs = spyController();
    const faq = spyController();
    const both = element('  tabs \n faq ');
    const report = vi.fn();
    await mountControllers(
      root(both, element(''), element()),
      { tabs: async () => tabs, faq: async () => faq },
      report,
    );
    expect(tabs.init).toHaveBeenCalledWith(both);
    expect(faq.init).toHaveBeenCalledWith(both);
    expect(report).not.toHaveBeenCalled();
  });

  it('reports unknown controllers, including inherited object keys', async () => {
    const report = vi.fn();
    await mountControllers(root(element('missing toString')), {}, report);
    expect(report.mock.calls.map(([error, name]) => [(error as Error).message, name])).toEqual([
      ['Unknown controller "missing"', 'missing'],
      ['Unknown controller "toString"', 'toString'],
    ]);
  });

  it('reports a failed loader or init and keeps mounting the others', async () => {
    const chunkError = new Error('chunk failed');
    const initError = new Error('init failed');
    const healthy = spyController();
    const registry: ControllerRegistry = {
      broken: () => Promise.reject(chunkError),
      throwing: async () => ({
        init: () => {
          throw initError;
        },
      }),
      healthy: async () => healthy,
    };
    const report = vi.fn();
    await mountControllers(
      root(element('broken'), element('throwing'), element('healthy')),
      registry,
      report,
    );
    expect(report).toHaveBeenCalledWith(chunkError, 'broken');
    expect(report).toHaveBeenCalledWith(initError, 'throwing');
    expect(healthy.init).toHaveBeenCalledTimes(1);
  });

  it('returns a cleanup that disposes every mounted controller', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const dispose = await mountControllers(
      root(element('a'), element('b')),
      { a: async () => ({ init: () => first }), b: async () => ({ init: () => second }) },
      vi.fn(),
    );
    expect(first).not.toHaveBeenCalled();
    dispose();
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('reports a failing cleanup and still runs the next ones', async () => {
    const cleanupError = new Error('cleanup failed');
    const next = vi.fn();
    const report = vi.fn();
    const dispose = await mountControllers(
      root(element('a'), element('b')),
      {
        a: async () => ({
          init: () => () => {
            throw cleanupError;
          },
        }),
        b: async () => ({ init: () => next }),
      },
      report,
    );
    dispose();
    expect(report).toHaveBeenCalledWith(cleanupError, 'a');
    expect(next).toHaveBeenCalledTimes(1);
  });
});
