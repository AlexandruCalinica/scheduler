type MessageState = 'continue' | 'park';
type Message = [MessageState, any];

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
    }
  }
}

export function makeSyncGenerator(
  fn: Function,
): (channel: Array<any>) => () => Generator<() => Message, void, void> {
  return function applyChannel(channel): () => Generator<() => Message, void, void> {
    return function* applyGenerator(): Generator<() => Message, void, void> {
      let val = null;
      if (channel.length > 0) {
        val = take(channel)()[1];
      }
      yield put(channel, fn(val));
    };
  };
}

export function channel(...fns: Function[]): void {
  let channel = [];
  fns.forEach((fn) => {
    let gen: Generator<() => Message, void, void> = makeSyncGenerator(fn)(channel)();
    register(gen, gen.next());
  });
}

export function put(channel: Array<any>, val: Function): () => Message {
  return function putMessage(): Message {
    if (channel.length === 0) {
      channel.unshift(val);
      return ['continue', null];
    } else {
      return ['park', null];
    }
  };
}

export function take(channel: Array<any>): () => Message {
  return function takeMessage(): Message {
    if (channel.length === 0) {
      return ['park', null];
    } else {
      let val = channel.pop();
      return ['continue', val];
    }
  };
}
