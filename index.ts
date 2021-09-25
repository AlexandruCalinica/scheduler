import { channel, composeChannels } from './src';

console.clear();

channel(
  () => channel('value1', ['value2'], { key: 'value3' }),
  () =>
    channel(
      () => 'value4',
      () => 'value5',
    ),
  () =>
    channel(
      async () => await Promise.resolve('value6'),
      async () =>
        await new Promise((resolve) => {
          setTimeout(() => resolve('value7'), 3000);
        }),
    ),
).then((v) => console.log('>>>> 1', v));

const chan1 = () =>
  channel('v1', 'v2', ['v3', 'v4', 'v5'], { v6: 'v6' }, (prev) => ({
    ...prev,
    v7: 'v7',
  }));

const chan2 = channel(
  async () => await Promise.resolve('v8'),
  (prev) =>
    new Promise((resolve) => {
      setTimeout(async () => resolve([await prev, 'v9']), 2000);
    }),
);

const prom = (val: any) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve('promise fulfilled');
    }, 1000);
  });

const chan3 = channel(
  'foo',
  (prev: any) => prom(prev),
  async (prev: any) => (await prev) + 'a',
  (prev: any) => (async (prev) => (await prev) + 'b')(prev),
  (prev: any) => {
    return prev.then((v: any) => v + 'a');
  },
  function () {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('waited 1 sec');
      }, 1000);
    });
  },
  async function () {
    return await new Promise((resolve) => setTimeout(() => resolve('waited another second'), 1000));
  },
);

composeChannels(chan1, chan2, chan3).then((v) => console.log('>>>> 2', v));
