import isFunction from 'lodash/isFunction';

export type MessageState = 'continue' | 'park' | 'wait';
export type Message = [MessageState, any];
export type YieldWrapper = { key: string; value: any };
export type ChannelFunctionValue = (prev: any) => any;
export type ChannelPrimitiveValue = string | number | boolean | Array<any> | Record<any, any>;
export type ChannelValues = ChannelPrimitiveValue | ChannelFunctionValue;

async function run(gen: () => AsyncGenerator<YieldWrapper>) {
  let result = [];
  for await (let next of gen()) {
    const { value } = next;
    result.push(value);
  }
  return result;
}

async function Yield(value: any, key: string): Promise<YieldWrapper> {
  return {
    key,
    value: await value,
  };
}

function stepper(values: Array<ChannelValues>, chan: Array<any>) {
  return async function* appliedStepper() {
    for (let i = 0; i < values.length; i++) {
      let next;
      const key = `${values[i].toString()}`;
      const prev = take(chan)[1];

      if (isFunction(values[i])) {
        next = (values[i] as ChannelFunctionValue)(prev);
      } else {
        next = values[i];
      }

      put(chan, next);
      yield Yield(next, key);
    }
  };
}

export function applyChannel(chan: Array<any> = []) {
  return function go(values: Array<ChannelValues>) {
    const result = run(stepper(values, chan));

    return result;
  };
}

export function channel(...values: Array<ChannelValues>) {
  let chan = [];
  const go = applyChannel(chan);

  return go(values);
}

export function composeChannels(...channels: Array<Promise<any> | (() => Promise<any>)>) {
  const masterChan = [];
  const go = applyChannel(masterChan);

  return go(channels);
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
