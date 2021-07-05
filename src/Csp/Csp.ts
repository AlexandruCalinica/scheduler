function _go(machine, step) {
  while (!step.done) {
    let arr = step.value(),
      state = arr[0],
      value = arr[1];

    switch (state) {
      case 'park':
        setImmediate(function () {
          _go(machine, step);
        });
        return;
      case 'continue':
        step = machine.next(value);
        break;
    }
  }
}

function makeGenerator(fn: Function): (channel) => Function {
  return function (channel) {
    return function* () {
      let val = null;
      if (channel.length > 0) {
        val = take(channel)()[1];
      }
      yield put(channel, fn(val));
    };
  };
}

export function go(...fns: Function[]) {
  let channel = [];
  fns.forEach((fn) => {
    let gen = makeGenerator(fn)(channel)();
    _go(gen, gen.next());
  });
}

export function put(chan, val) {
  return function () {
    if (chan.length === 0) {
      chan.unshift(val);
      return ['continue', null];
    } else {
      return ['park', null];
    }
  };
}

export function take(chan) {
  return function () {
    if (chan.length === 0) {
      return ['park', null];
    } else {
      let val = chan.pop();
      return ['continue', val];
    }
  };
}
