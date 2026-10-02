import { describe, expect, it, vi } from 'vitest';
import { canUseWebGL, readEnvironment, type WebGLEnvironment } from './capability.ts';

const CAPABLE: WebGLEnvironment = {
  motionAllowed: true,
  hasWebGL2: () => true,
  saveData: false,
  deviceMemory: 8,
  hardwareConcurrency: 8,
};

describe('canUseWebGL (E1)', () => {
  it('accepts a capable device with motion allowed', () => {
    expect(canUseWebGL(CAPABLE)).toBe(true);
  });

  it('refuses when motion is not allowed (reduced motion, calm mode)', () => {
    expect(canUseWebGL({ ...CAPABLE, motionAllowed: false })).toBe(false);
  });

  it('refuses without a WebGL 2 context', () => {
    expect(canUseWebGL({ ...CAPABLE, hasWebGL2: () => false })).toBe(false);
  });

  it('refuses when the visitor asked to save data', () => {
    expect(canUseWebGL({ ...CAPABLE, saveData: true })).toBe(false);
  });

  it('refuses a device with less than 4 GB of memory, when the browser tells', () => {
    expect(canUseWebGL({ ...CAPABLE, deviceMemory: 2 })).toBe(false);
    expect(canUseWebGL({ ...CAPABLE, deviceMemory: 4 })).toBe(true);
    expect(canUseWebGL({ ...CAPABLE, deviceMemory: undefined })).toBe(true);
  });

  it('refuses fewer than 4 logical cores, when the browser tells', () => {
    expect(canUseWebGL({ ...CAPABLE, hardwareConcurrency: 2 })).toBe(false);
    expect(canUseWebGL({ ...CAPABLE, hardwareConcurrency: 4 })).toBe(true);
    expect(canUseWebGL({ ...CAPABLE, hardwareConcurrency: undefined })).toBe(true);
  });

  it('only creates a context once every cheaper check passed', () => {
    const hasWebGL2 = vi.fn(() => true);
    canUseWebGL({ ...CAPABLE, saveData: true, hasWebGL2 });
    canUseWebGL({ ...CAPABLE, motionAllowed: false, hasWebGL2 });
    expect(hasWebGL2).not.toHaveBeenCalled();
    canUseWebGL({ ...CAPABLE, hasWebGL2 });
    expect(hasWebGL2).toHaveBeenCalledOnce();
  });
});

describe('readEnvironment', () => {
  const loseContext = vi.fn();
  const fakeDocument = (context: unknown, classes: string[] = ['motion-ok']) => ({
    documentElement: { classList: { contains: (name: string) => classes.includes(name) } },
    createElement: () => ({
      getContext: (type: string) => (type === 'webgl2' ? context : null),
    }),
  });
  const context = { getExtension: () => ({ loseContext }) };

  it('reads motion-ok, the network and the hardware hints', () => {
    const env = readEnvironment(fakeDocument(context), {
      connection: { saveData: true },
      deviceMemory: 2,
      hardwareConcurrency: 6,
    });
    expect(env).toMatchObject({
      motionAllowed: true,
      saveData: true,
      deviceMemory: 2,
      hardwareConcurrency: 6,
    });
  });

  it('leaves unknown hints undefined', () => {
    const env = readEnvironment(fakeDocument(context, []), {});
    expect(env).toMatchObject({
      motionAllowed: false,
      saveData: false,
      deviceMemory: undefined,
      hardwareConcurrency: undefined,
    });
  });

  it('probes WebGL 2 on a throwaway canvas and releases the context at once', () => {
    expect(readEnvironment(fakeDocument(context), {}).hasWebGL2()).toBe(true);
    expect(loseContext).toHaveBeenCalledOnce();
    expect(readEnvironment(fakeDocument(null), {}).hasWebGL2()).toBe(false);
  });

  it('treats a throwing getContext as no WebGL', () => {
    const throwing = {
      ...fakeDocument(context),
      createElement: () => ({
        getContext: () => {
          throw new Error('blocked');
        },
      }),
    };
    expect(readEnvironment(throwing, {}).hasWebGL2()).toBe(false);
  });
});
