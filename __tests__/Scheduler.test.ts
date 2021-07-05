import { Scheduler } from '../src/Scheduler';

describe('Scheduler.of()', () => {
  it('Should return a Scheduler instance', () => {
    const scheduler = Scheduler.of(() => {});

    expect(scheduler.work.length).toBe(1);
    expect(scheduler.workList.size).toBe(1);
    expect(scheduler).toBeInstanceOf(Scheduler);
  });
});
