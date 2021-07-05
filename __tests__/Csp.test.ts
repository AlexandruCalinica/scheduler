import { channel } from '../src/Csp';

describe('channel()', () => {
  let res;

  channel(
    () => 'hello',
    (val) => (res = val + ' ' + 'world'),
  );

  it('Should return hello world', () => {
    expect(res).toBe('hello world');
  });
});
