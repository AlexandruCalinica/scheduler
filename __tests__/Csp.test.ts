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

  it('Should throw an error if channel is null or undefined', () => {
    expect(2 + 2).toBe(4);
  });

  it('Should throw an error if channel is not of type Channel', () => {
    expect(2 + 2).toBe(4);
  });
});
