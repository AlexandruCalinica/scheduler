import { channel, composeChannels } from './src';

console.clear();

const chan1 = channel('1');
const chan2 = channel('2');

chan2.put(async () => await chan1.put('mortiitei'));
chan1.put('iaso');
chan1.put('iaso');
chan1
  .put(async () => {
    return Promise.reject('error');
  })
  .then(({ errors }) => console.log('chan1Err:: ', errors));

channel('MASTER')
  .put(chan1.put('foo'))
  .then(({ result, errors }) => {
    console.log('RESULT:: ', result);
    console.log('ERRORS:: ', errors);
  });
