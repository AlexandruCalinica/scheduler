import { WorkNode } from '../';

export class LinkedList<T> {
  head: WorkNode<T>;
  size: number = 0;

  constructor(head: WorkNode<T> | null = null, size: number = 0) {
    if (head) {
      this.head = head;
    }
    if (size) {
      this.size = size;
    }
  }

  public static of<T>(head: WorkNode<T> | null = null, size: number = 0): LinkedList<T> {
    return new LinkedList<T>(head, size);
  }

  public addNodeToHead(value: T): LinkedList<T> {
    let newHead = WorkNode.of<T>(value, this.head);
    return LinkedList.of<T>(newHead, this.size + 1);
  }

  public findWorkNode(
    head: WorkNode<T>,
    { prop = null, value = null }: { prop: keyof T | null; value: T | string | number | null },
  ) {
    return findNode<T>(head, { prop, value });
  }
}

function findNode<T>(
  head: WorkNode<T>,
  { prop = null, value = null }: { prop: keyof T | null; value: T | string | number | null },
) {
  if (!head.next) {
    throw new Error('Finished traversing the linked list. No WorkNode found.');
  }
  if (!prop && !value) {
    throw new Error('The options parameter is undefined.');
  }
  if (prop && !value) {
    throw new Error(`Found parameter options.prop=${prop} but options.value is null.`);
  }
  if (!prop && value) {
    if (head.value === value) {
      return head;
    }
  }
  if (head.value[`${prop}`] === value) {
    return head;
  }
  findNode(head.next, { prop, value });
}
