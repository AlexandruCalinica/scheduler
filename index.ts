import { channel, composeChannels } from './src';

console.clear();

const chan1 = channel('1');
const chan2 = channel('2');

chan2.put(async () => await chan1.put('mortiitei'));

chan1.put('pla');

channel('MASTER')
  .put(chan1.put('foo'))
  .then(({ result }) => {
    console.log('RESULT:: ', result);
  });
