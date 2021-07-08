import { channel, makeSyncGenerator, take, put, Message, MessageState } from '../src/Csp';

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

describe('take()', () => {
  it('Should return a curried function that returns a Message object', () => {
    const fn = () => 'result';
    const channel = [fn];

    const firstCall = take(channel);
    const secondCall = firstCall();

    expect(firstCall).toBeInstanceOf(Function);
    expect(secondCall).toStrictEqual(['continue', fn]);
  });

  it(`Should return a 'park' Message object when called with an empty channel`, () => {
    const channel = [];

    const firstCall = take(channel);
    const secondCall = firstCall();

    expect(firstCall).toBeInstanceOf(Function);
    expect(secondCall).toStrictEqual(['park', null]);
  });

  it('Should throw an error if channel is not an Array', () => {
    const c1 = {};
    const c2 = 0;
    const c3 = 'test';
    const c4 = () => {};
    const c5 = undefined;
    const c6 = null;

    const t1 = () => take(c1 as []);
    const t2 = () => take(c2 as unknown as []);
    const t3 = () => take(c3 as unknown as []);
    const t4 = () => take(c4 as unknown as []);
    const t5 = () => take(c5);
    const t6 = () => take(c6);

    expect(t1).toThrowError(`Received ${c1} for <channel>. Parameter <channel> must be an Array.`);
    expect(t2).toThrowError(`Received ${c2} for <channel>. Parameter <channel> must be an Array.`);
    expect(t3).toThrowError(`Received ${c3} for <channel>. Parameter <channel> must be an Array.`);
    expect(t4).toThrowError(`Received ${c4} for <channel>. Parameter <channel> must be an Array.`);
    expect(t5).toThrowError(`Received ${c5} for <channel>. Parameter <channel> must be an Array.`);
    expect(t6).toThrowError(`Received ${c6} for <channel>. Parameter <channel> must be an Array.`);
  });
});

describe('put()', () => {
  it('Should throw an error if channel is not an Array', () => {
    const c1 = {};
    const c2 = 0;
    const c3 = 'test';
    const c4 = () => {};
    const c5 = undefined;
    const c6 = null;

    const p1 = () => put(c1 as [], () => {});
    const p2 = () => put(c2 as unknown as [], () => {});
    const p3 = () => put(c3 as unknown as [], () => {});
    const p4 = () => put(c4 as unknown as [], () => {});
    const p5 = () => put(c5, () => {});
    const p6 = () => put(c6, () => {});

    expect(p1).toThrowError(`Received ${c1} for <channel>. Parameter <channel> must be an Array.`);
    expect(p2).toThrowError(`Received ${c2} for <channel>. Parameter <channel> must be an Array.`);
    expect(p3).toThrowError(`Received ${c3} for <channel>. Parameter <channel> must be an Array.`);
    expect(p4).toThrowError(`Received ${c4} for <channel>. Parameter <channel> must be an Array.`);
    expect(p5).toThrowError(`Received ${c5} for <channel>. Parameter <channel> must be an Array.`);
    expect(p6).toThrowError(`Received ${c6} for <channel>. Parameter <channel> must be an Array.`);
  });
});
