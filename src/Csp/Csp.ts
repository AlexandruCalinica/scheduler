type MessageState = 'continue' | 'park';

type Message = [MessageState, any];

function register(generator: Generator, step: any) {
  while (!step.done) {
    let arr = step.value(),
      state = arr[0],
      value = arr[1];

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

function makeSyncGenerator(fn: Function): (channel: Array<any>) => Function {
  return function (channel): Function {
    return function* (): Generator {
      let val = null;
      if (channel.length > 0) {
        val = take(channel)()[1];
      }
      yield put(channel, fn(val));
    };
  };
}

export function channel(...fns: Function[]) {
  let channel = [];
  fns.forEach((fn) => {
    let gen: Generator = makeSyncGenerator(fn)(channel)();
    register(gen, gen.next());
  });
}

export function put(chan: Array<any>, val: any) {
  return function () {
    if (chan.length === 0) {
      chan.unshift(val);
      return ['continue', null];
    } else {
      return ['park', null];
    }
  };
}

export function take(chan: Array<any>) {
  return function () {
    if (chan.length === 0) {
      return ['park', null];
    } else {
      let val = chan.pop();
      return ['continue', val];
    }
  };
}
