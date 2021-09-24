export type MessageState = 'continue' | 'park' | 'wait';
export type Message = [MessageState, any];

async function run(gen: any) {
  let result = [];
  for await (let val of gen()) {
    console.log(val);
    result.push(val);
  }
  return result;
}

export function channel(...values: Array<(prev: any) => any>) {
  const chan: any[] = [];

  async function* stepper() {
    for (let i = 0; i < values.length; i++) {
      const prev = take(chan)[1];
      const next = values[i](prev);
      put(chan, next);
      yield next;
    }
  }

  const result = run(stepper);

  return {
    chan,
    result,
  };
}

export function put(channel: Array<any>, value: any) {
  if (!Array.isArray(channel)) {
    throw new Error(`Received ${channel} for <channel>. Parameter <channel> must be an Array.`);
  }
  if (channel.length === 0) {
    channel.unshift(value);
    return ['continue', null];
  } else {
    return ['park', null];
  }
}

export function take(channel: Array<any>) {
  if (!Array.isArray(channel)) {
    throw new Error(`Received ${channel} for <channel>. Parameter <channel> must be an Array.`);
  }
  if (channel.length === 0) {
    return ['park', null];
  } else {
    const val = channel.pop();
    return ['continue', val];
  }
}

function memoize(fn: any) {
  // return a new anonymous function that will set a cache property on the argument function
  return function () {
    // slice the arguments
    let args = Array.prototype.slice.call(arguments);

    // set a property named 'cache' as the existing 'cache' value
    // or if the cache does not exist assing an empty object
    fn.cache = fn.cache || {};

    // If the arguments are cached return the cached value :: {args: value}
    // Else, call the function with the arguments and update the cache
    return fn.cache[args] ? fn.cache[args] : (fn.cache[args] = fn.apply(this, args));
  };
}
