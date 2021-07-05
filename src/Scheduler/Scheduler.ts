import { LinkedList } from '../LinkedList';
import { WorkNode } from '../WorkNode';

interface Work {
  id: string;
  fn: Function;
}

export class Scheduler {
  work: Array<Function>;
  workList: LinkedList<Work>;

  constructor(fns: Array<Function>) {
    this.work = fns.reverse();
    this.workList = LinkedList.of<Work>();
    fns.forEach((fn) => {
      this.workList = this.workList.addNodeToHead({ id: guid(), fn });
    });
  }

  public static of(...args: Array<Function>) {
    return new Scheduler(args);
  }

  public schedule(fn: Function) {
    return Scheduler.of(...this.work.reverse(), fn);
  }

  public dispatch() {
    if (this.workList.head) {
      return this.execute(this.workList.head);
    } else {
      throw new Error('Work list is empty. There is no function scheduled.');
    }
  }

  private *execute(work: WorkNode<Work>): any {
    work.value.fn();
    if (!work.next) {
      yield 'Scheduled work done.';
    } else {
      yield* this.execute(work.next);
    }
  }
}

function guid() {
  let s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
