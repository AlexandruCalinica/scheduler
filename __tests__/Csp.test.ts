import { go } from '../src/Csp';

describe('Csp', () => {
  let res;

  go(
    () => 'hello',
    (val) => (res = val + ' ' + 'world'),
  );

  it('Should return hello world', () => {
    expect(res).toBe('hello world');
  });
});
