import { channel, composeChannels } from './src';

console.clear();

const chan1 = channel('1');
const chan2 = channel('2');

chan2(async () => await chan1('mortiitei'));

chan1('pla');

channel('MASTER')(chan1('foo')).then(({ result }) => {
  console.log('RESULT:: ', result);
});
