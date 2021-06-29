import { WorkNode } from "./WorkNode";

export class LinkedList<T> {
  head: WorkNode<T>;
  size: number = 0;

  constructor(head: WorkNode<T> | null = null, size: number = 0) {
    if (head && size) {
      this.head = head;
      this.size = size;
    }
  }

  public static of<T>(
    head: WorkNode<T> | null = null,
    size: number = 0
  ): LinkedList<T> {
    return new LinkedList<T>(head, size);
  }

  public addNodeToHead(value: T): LinkedList<T> {
    let newHead = WorkNode.of<T>(value, this.head);
    return LinkedList.of<T>(newHead);
  }
}
