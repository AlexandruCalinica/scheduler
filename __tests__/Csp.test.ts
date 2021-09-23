import { channel, gen, take, put, register, chan, takeAsync } from '../src/Csp';

describe('channel()', () => {
  it('Should return hello world', () => {
    let res;

    channel(
      () => 'hello',
      (val) => (res = val + ' ' + 'world'),
    );
    expect(res).toBe('hello world');
  });

  it('Should return hello world from async', () => {
    const asyncCall = () =>
      new Promise((resolve) => {
        resolve('world');
      });

    channel(
      () => 'hello',
      async (val) => {
        try {
          const data = await asyncCall();
          return val + ' ' + data;
        } catch (err) {
          return err;
        }
      },
      async (val) => {
        const data = await val;
        expect(data).toBe('hello world');
      },
    );
  });
});

describe('chan()', () => {
  it('Should return hello world', () => {
    const { go } = chan();

    let res;

    go(() => 'hello');
    go((val) => val + ' ' + 'world');
    go((val) => (res = val));

    expect(res).toBe('hello world');
  });

  it('Should return hello world from async', () => {
    const asyncCall = () =>
      new Promise((resolve) => {
        resolve('world');
      });

    const { go } = chan();

    let res;

    go(() => 'hello');
    go(async (val) => val + ' ' + (await asyncCall()));
    go(async (val) => (res = await val));
    go(async (val) => expect(await val).toBe('hello world'));
  });
});

describe('Usecase 2 - PingPong', () => {
  it('Should take message from other channel', () => {
    const chanA = chan();
    const chanB = chan();

    let ping, pong, pingpong;

    chanA.go(() => 'ping');

    chanB.go(() => {
      ping = take(chanA.channel)()[1];
      return 'pong';
    });

    chanA.go(() => {
      pong = take(chanB.channel)()[1];
      pingpong = ping + ' ' + pong;
    });

    expect(ping).toBe('ping');
    expect(pong).toBe('pong');
    expect(pingpong).toBe('ping pong');
  });

  it('Should put message into other channel', () => {
    const chanA = chan();
    const chanB = chan();

    let ping, pong, pingpong;

    chanA.go(() => 'ping');

    chanA.go((val) => {
      ping = val;
      put(chanB.channel, 'pong')();
    });

    chanB.go((val) => {
      pong = val;
      take(chanA.channel)();
      put(chanA.channel, 'pingpong')();
    });

    chanA.go((val) => {
      pingpong = val;
    });

    expect(ping).toBe('ping');
    expect(pong).toBe('pong');
    expect(pingpong).toBe('pingpong');
  });

  it('Should put message into other channel - Async', () => {
    const chanA = chan();
    const chanB = chan();

    const asyncCall = () =>
      new Promise((resolve) => {
        resolve('world');
      });

    let hello, world;

    chanA.go(() => 'hello');
    chanA.goAsync(async (val) => {
      hello = val;
      const asyncVal = await asyncCall();
      console.log('log 1', asyncVal);
      chanB.goAsync(() => asyncVal);
    });

    chanB.goAsync(async (val) => {
      console.log('log 2', await val);
      world = await val;
    });

    expect(hello).toBe('hello');
    expect(world).toBe('world');
  });
});

it('Async POC', () => {
  const c = chan();

  const asyncCall = () =>
    new Promise((resolve) => {
      resolve('world');
    });

  c.go(() => 'hello');
  c.go(async (val) => {
    const v = await asyncCall();
    return val + ' ' + v;
  });
  c.goAsync(async (val) => {
    console.log('last', val);
    expect(val).toBe('hello world');
  });
});

it.only('Async POC 2', () => {
  const c = chan();
  let res;

  const asyncCall = () =>
    new Promise((resolve) => {
      resolve('world');
    });

  c.basic(function* () {
    yield put(c.channel, 'hello')();
  });

  // c.basic(async function* () {
  //   try {
  //     const res = await asyncCall();
  //     const prev = await takeAsync(c.channel)()[1];
  //     console.log('prev, res -- ', prev, res);
  //     yield put(c.channel, prev + ' ' + res)();
  //   } catch (err) {
  //     console.log(err);
  //   }
  // });

  c.basic(function* () {
    const val = take(c.channel)()[1];
    yield put(c.channel, val)();
  });

  c.basic(function* () {
    res = take(c.channel)()[1];
  });

  expect(res).toBe('hello');
});

describe('Usecase 1', () => {
  it('Should return hello world', () => {
    let res;
    const channel = [];
    const gen1 = gen(() => 'hello')(channel)();
    const gen2 = gen((val) => val + ' ')(channel)();
    const gen3 = gen((val) => val + 'world')(channel)();
    const gen4 = gen((val) => {
      res = val;
    })(channel)();

    register(gen1, gen1.next());
    register(gen2, gen2.next());
    register(gen3, gen3.next());
    register(gen4, gen4.next());

    expect(res).toBe('hello world');
  });
});

describe('gen()', () => {
  it('Should return a generator function', () => {
    const channel = [];
    const mes = gen(() => 'result')(channel);

    expect(mes).toBeInstanceOf(Function);
    expect(mes().next).toBeTruthy();
    expect(mes().return).toBeTruthy();
    expect(mes().throw).toBeTruthy();
    expect(mes().throw).toBeInstanceOf(Function);
  });

  it('.next() should return an object of shape { value: Function, done: Boolean }', () => {
    const channel = [];
    const mes = gen(() => 'result')(channel);

    const next = mes().next();

    expect(next.value).toBeInstanceOf(Function);
    expect(next.done).toBe(false);
  });

  it('.return() should return an object of shape { value: undefined, done: Boolean }', () => {
    const channel = [];
    const mes = gen(() => 'result')(channel);

    const _return = mes().return();

    expect(_return.value).toBeUndefined();
    expect(_return.done).toBe(true);
  });

  it('.throw() should throw an error', () => {
    const channel = [];
    const mes = gen(() => 'result')(channel);

    const test = () => mes().throw('error');

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
  it(`Should unshift <value> and return a 'continue' Message object when called with an empty channel`, () => {
    const channel = [];
    const val = () => {};

    const p1 = put(channel, val);
    const p2 = p1();

    expect(p1).toBeInstanceOf(Function);
    expect(p2).toStrictEqual(['continue', null]);
    expect(channel).toHaveLength(1);
    expect(channel[0]).toBe(val);
  });

  it(`Should return a 'park' Message object if called with a channel of length > 0`, () => {
    const channel = [() => {}];
    const val = () => {};

    const p1 = put(channel, val);
    const p2 = p1();

    expect(p1).toBeInstanceOf(Function);
    expect(p2).toStrictEqual(['park', null]);
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
