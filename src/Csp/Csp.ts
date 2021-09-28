import isFunction from 'lodash/isFunction';

import {
  Chan,
  Message,
  ChannelError,
  YieldWrapper,
  MessageState,
  ChannelValues,
  ChannelReturnType,
  ChannelFunctionValue,
  ChannelPrimitiveValue,
  InternalOperatorFunction,
} from './types';

async function run(
  channelName: string,
  gen: () => AsyncGenerator<YieldWrapper>,
): Promise<ChannelReturnType> {
  let result = [];
  let errors = [];
  let _store = {};
  let currKey = null;

  try {
    for await (let next of gen()) {
      const { value, isChannel, store, key } = next;
      const nextValue = isChannel ? value.result : value;

      currKey = key;
      result.push(nextValue);
      store[key] = nextValue;
      _store = store;
    }
  } catch (err) {
    const error = new ChannelError(err, currKey);
    errors.push(error);
  }
  return { name: channelName, result, errors, store: _store };
}

function isInternalFunction(name: string) {
  return Object.values(InternalOperatorFunction).includes(name as InternalOperatorFunction);
}

async function Yielder(current: any, chan: Chan, index: number): Promise<YieldWrapper> {
  let value: any;
  let isChannel = false;
  const { name, body, store } = chan;
  const key = `${name}__${index}`;

  const previous = take(body)[1];

  if (isFunction(current)) {
    if (isInternalFunction((current as Function).name)) {
      isChannel = true;
    }
    value = await current(previous);
    if (value.name === name) {
      value = null;
      throw new Error('Cannot use a channel inside itself. This will cause an infinite loop.');
    }
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

export function channel(name: string) {
  let state = {
    name,
    body: [],
    store: {},
    record: [],
  };

  return {
    put(...values: Array<ChannelValues>) {
      return __put__(values, state);
    },
    putFirst(...values: Array<ChannelValues>) {
      return __putFirst__(values, state);
    },
    putAt(index: number, ...values: Array<ChannelValues>) {
      return __putAt__(values, state, index);
    },
  };
}

function __put__(values: Array<ChannelValues>, chan: Chan) {
  chan.record.push(...values);
  const result = go(chan)(chan.record);
  return result;
}

function __putAt__(values: Array<ChannelValues>, chan: Chan, index: number) {
  chan.record.splice(index, 0, ...values);
  const result = go(chan)(chan.record);
  return result;
}

function __putFirst__(values: Array<ChannelValues>, chan: Chan) {
  chan.record.splice(0, 0, ...values);
  const result = go(chan)(chan.record);
  return result;
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

function ChannelError(this: ChannelError, message: string, location: string) {
  this.message = message;
  this.location = location;
}
