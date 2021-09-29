import { channel } from './src';

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

chan2.put('iar am puso', async () => await chan1.takeAt(0));

channel('MASTER')
  .put(chan1.put('foo'), () => chan2.put())
  .then(({ result, errors }) => {
    console.log('RESULT:: ', result);
    console.log('ERRORS:: ', errors);
    console.log(result[1]);
  });
