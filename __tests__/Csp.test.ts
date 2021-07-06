import { channel, makeSyncGenerator, take, put } from '../src/Csp';

describe('channel()', () => {
  let res;

  channel(
    () => 'hello',
    (val) => (res = val + ' ' + 'world'),
  );

  it('Should return hello world', () => {
    expect(res).toBe('hello world');
  });
});

describe('makeSyncGenerator()', () => {
  it('Should return a generator function', () => {
    const channel = [];
    const gen = makeSyncGenerator(() => 'result')(channel);

    expect(gen).toBeInstanceOf(Function);
    expect(gen().next).toBeTruthy();
    expect(gen().return).toBeTruthy();
    expect(gen().throw).toBeTruthy();
    expect(gen().throw).toBeInstanceOf(Function);
  });

  it('.next() should return an object of shape { value: Function, done: Boolean }', () => {
    const channel = [];
    const gen = makeSyncGenerator(() => 'result')(channel);

    const next = gen().next();

    expect(next.value).toBeInstanceOf(Function);
    expect(next.done).toBe(false);
  });

  it('.return() should return an object of shape { value: undefined, done: Boolean }', () => {
    const channel = [];
    const gen = makeSyncGenerator(() => 'result')(channel);

    const _return = gen().return();

    expect(_return.value).toBeUndefined();
    expect(_return.done).toBe(true);
  });

  it('.throw() should throw an error', () => {
    const channel = [];
    const gen = makeSyncGenerator(() => 'result')(channel);

    const test = () => gen().throw('error');

    expect(test).toThrowError('error');
  });
});
