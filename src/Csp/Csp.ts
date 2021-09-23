export type MessageState = 'continue' | 'park';
export type Message = [MessageState, any];
export type MessageGenerator = Generator<() => Message, void, any>;
export type AsyncMessageGenerator = AsyncGenerator<() => Message, void, any>;

export function register(generator: Generator, step: IteratorResult<any>): void {
  while (!step.done) {
    let message = step.value();
    let state = message[0];
    let value = message[1];

    switch (state) {
      case 'park':
        setImmediate(function () {
          register(generator, step);
        });
        return;
      case 'continue':
        step = generator.next(value);
        break;
      case 'waitContinue':
        step = (async () => generator.next(await value))() as any;
        break;
    }
  }
}

export function gen(fn: Function): (channel: Array<any>) => () => MessageGenerator {
  return function applyChannel(channel: Array<any>): () => MessageGenerator {
    return function* applyGenerator(): MessageGenerator {
      let val = null;
      if (channel.length) {
        val = take(channel)()[1];
      }
      const nextVal = fn(val);
      yield put(channel, nextVal);
    };
  };
}

export function channel(...fns: Function[]): void {
  let channel = [];
  fns.forEach((fn) => {
    let mes: MessageGenerator = gen(fn)(channel)();
    register(mes, mes.next());
  });
}

//
interface Options {
  async?: boolean;
}

function _gen(channel: Array<any>) {
  return function applyFn(fn: Function, options: Options) {
    return function* applyGen(): MessageGenerator {
      let value = null;
      let state = null;
      if (channel.length) {
        const message = take(channel)();
        state = message[0];
        value = message[1];
      }
      yield put(channel, fn(value, state));
    };
  };
}

function _genAsync(channel: Array<any>) {
  return function applyFn(fn: Function, options: Options) {
    return async function* applyGen(): AsyncMessageGenerator {
      let value = null;
      let state = null;
      if (channel.length) {
        const message = await takeAsync(channel)();
        state = message[0];
        value = message[1];
      }
      yield put(channel, fn(value, state));
    };
  };
}

export function chan() {
  let channel = [];
  const go = (fn: Function, options?: Options) => {
    const mes = _gen(channel)(fn, options)();
    register(mes, mes.next());
  };

  const goAsync = async (fn: Function, options?: Options) => {
    const mes = _genAsync(channel)(fn, options)();
    try {
      const next = await mes.next();
      register(mes as any, next);
    } catch (err) {
      console.log(err);
    }
  };

  const basic = async (fn: () => Generator | AsyncGenerator) => {
    try {
      const applied = fn();
      register(applied as any, applied.next() as any);
    } catch (error) {
      console.log(error);
    }
  };

  return {
    go,
    basic,
    goAsync,
    channel,
  };
}
//

export function put(channel: Array<Function>, value: any): () => Message {
  if (!Array.isArray(channel)) {
    throw new Error(`Received ${channel} for <channel>. Parameter <channel> must be an Array.`);
  }
  return function putMessage(): Message {
    if (channel.length === 0) {
      channel.unshift(value);
      return ['continue', null];
    } else {
      return ['park', null];
    }
  };
}

export function take(channel: Array<Function>): () => Message {
  if (!Array.isArray(channel)) {
    throw new Error(`Received ${channel} for <channel>. Parameter <channel> must be an Array.`);
  }
  return function takeMessage(): Message {
    if (channel.length === 0) {
      return ['park', null];
    } else {
      let val = channel.pop();
      console.log('take val -> ', val);
      return ['continue', val];
    }
  };
}

export function takeAsync(channel: Array<Promise<any>>): () => Promise<Message> {
  if (!Array.isArray(channel)) {
    throw new Error(`Received ${channel} for <channel>. Parameter <channel> must be an Array.`);
  }
  return async function takeMessage(): Promise<Message> {
    if (channel.length === 0) {
      return ['park', null];
    } else {
      let val = await channel.pop();
      console.log('take val async -> ', val);
      return ['continue', val];
    }
  };
}
