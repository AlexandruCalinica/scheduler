import { channel, take, put } from '../src/Csp';

describe('channel()', () => {
  it('Should pass demo test', () => {
    expect.assertions(1);

    const prom = (val: any) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve('promise fulfilled');
        }, 1000);
      });

    return expect(
      channel(
        () => 'foo',
        (prev: any) => prom(prev),
        async (prev: any) => (await prev) + 'a',
        (prev: any) => (async (prev) => (await prev) + 'b')(prev),
        (prev: any) => {
          return prev.then((v: any) => v + 'a');
        },
        function () {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve('waited 1 sec');
            }, 1000);
          });
        },
        async function () {
          return await new Promise((resolve) =>
            setTimeout(() => resolve('waited another second'), 1000),
          );
        },
      ),
    ).resolves.toStrictEqual([
      'foo',
      'promise fulfilled',
      'promise fulfilleda',
      'promise fulfilledab',
      'promise fulfilledaba',
      'waited 1 sec',
      'waited another second',
    ]);
  });
});

describe('take()', () => {
  it('Should return a curried function that returns a Message object', () => {
    const fn = () => 'result';
    const channel = [fn];

    const res = take(channel);

    expect(res).toStrictEqual(['continue', fn]);
  });

  it(`Should return a 'park' Message object when called with an empty channel`, () => {
    const channel = [];

    const res = take(channel);

    expect(res).toStrictEqual(['park', null]);
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
  it(`Should unshift <value> and return a 'continue' Message object when called with an empty channel`, () => {
    const channel = [];
    const val = () => {};

    const res = put(channel, val);

    expect(res).toStrictEqual(['continue', null]);
    expect(channel).toHaveLength(1);
    expect(channel[0]).toBe(val);
  });

  it(`Should return a 'park' Message object if called with a channel of length > 0`, () => {
    const channel = [() => {}];
    const val = () => {};

    const res = put(channel, val);

    expect(res).toStrictEqual(['park', null]);
    expect(channel).toHaveLength(1);
  });

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
