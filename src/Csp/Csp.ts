import isFunction from 'lodash/isFunction';

export type MessageState = 'continue' | 'park' | 'wait';
export type Message = [MessageState, any];
export type ChannelReturnType = {
  name: string;
  result: Array<ChannelReturnType | any>;
  errors: Array<any>;
  store: Record<string, any>;
};
export type ChannelFunctionValue = (prev: any) => any;
export type ChannelValues = ChannelPrimitiveValue | ChannelFunctionValue;
export type Chan = {
  name: string;
  body: Array<any>;
  store: Record<string, any>;
  record: Array<any>;
};
export type ChannelPrimitiveValue = string | number | boolean | Array<any> | Record<any, any>;
export type YieldWrapper = {
  key: string;
  value: any;
  store: Record<string, any>;
  isChannel: boolean;
};

async function run(
  channelName: string,
  gen: () => AsyncGenerator<YieldWrapper>,
): Promise<ChannelReturnType> {
  let result = [];
  let errors = [];
  let _store = {};
  try {
    for await (let next of gen()) {
      const { value, isChannel, store, key } = next;
      let nextValue;

      /** no effect since promises are already awaited; */
      if (key in store) {
        nextValue = store[key];
      } else {
        nextValue = isChannel ? value.result : value;
      }

      result.push(nextValue);
      store[key] = nextValue;
      _store = store;
    }
  } catch (err) {
    errors.push(err);
  }
  return { name: channelName, result, errors, store: _store };
}

async function Yielder(current: any, chan: Chan, index: number): Promise<YieldWrapper> {
  let value: any;
  let isChannel = false;
  const { name, body, store } = chan;
  const key = `${name}__${index}`;

  /** should check the store for existing keys and return values */
  console.log(key, store, current);

  const previous = take(body)[1];

  if (isFunction(current)) {
    if ((current as Function).name === '__appliedChannel__') {
      isChannel = true;
    }
    value = await current(previous);
  } else {
    value = await current;
  }

  put(body, value);

  return {
    key,
    value,
    store,
    isChannel,
  };
}

function stepper(values: Array<ChannelValues>, chan: Chan) {
  return async function* appliedStepper() {
    for (let i = 0; i < values.length; i++) {
      let current = values[i];
      yield Yielder(current, chan, i);
    }
  };
}

function go(chan: Chan) {
  return function appliedGo(values: Array<ChannelValues>) {
    const result = run(chan.name, stepper(values, chan));

    return result;
  };
}

// Should throw an error if a channel instance is returned from a function inside the same channel.
// This causes an infinite loop and is also redundant;
// ex: chan1(async () => chan1('foo'));
// works this way: chan1(chan1('baz'));

export function channel(name: string) {
  let store = {}; // once this is applied, cannot be updated;
  let record = [];
  console.log('storeul vietii', store);
  // maybe return a sync fn that sets some flags for the store
  return function __appliedChannel__(...values: Array<ChannelValues>) {
    let chan = {
      name,
      body: [],
      store, // always empty object when this fn is called;
      record,
    };

    if (Object.values(store).length) {
      console.log('STORE:: ', store);
      console.log('RECORD:: ', record);
      // return;
    }
    record = [...record, ...values];
    const result = go(chan)(record);

    return result;
  };
}

export function composeChannels(...channels: Array<Promise<any> | (() => Promise<any>)>) {
  const masterChan = {
    name: 'master',
    body: [],
    store: {},
    record: [],
  };
  const appliedGo = go(masterChan);

  return appliedGo(channels);
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
