import { LinkedList } from "../LinkedList";

export class LinkedListConsumer<T> {
  linkedList: LinkedList<T>;

  constructor() {
    this.linkedList = new LinkedList<T>();
  }
}

export class LinkedListStaticConsumer {
  linkedList: typeof LinkedList;

  constructor() {
    this.linkedList = LinkedList;
  }
}
