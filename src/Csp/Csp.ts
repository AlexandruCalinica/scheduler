export type MessageState = 'continue' | 'park' | 'wait';
export type Message = [MessageState, any];
export type MessageGenerator = Generator<() => Message, void, any>;
export type AsyncMessageGenerator = AsyncGenerator<() => Message, void, any>;

async function run(gen: any) {
  for await (let val of gen()) {
    console.log(val);
  }
}

export function channel(...fns: any[]) {
  const channel: any[] = [];

  async function* stepper() {
    for (let i = 0; i < fns.length; i++) {
      const currVal = take(channel)[1];
      put(channel, fns[i](currVal));
      yield fns[i](currVal);
    }
  }

  run(stepper);
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
