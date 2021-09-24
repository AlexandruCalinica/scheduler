import { channel } from './src';

console.clear();

let a, b, c;

const { result } = channel(
  () => (a = 'value1'),
  () => (b = 'value2'),
  () => (c = 'value3'),
);

console.log('values -> ', a, b, c);

const values = result.then((v) => console.log(v));
