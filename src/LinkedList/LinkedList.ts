import { WorkNode } from '../';
import { isNil, isEmpty } from 'lodash';

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
    options: { prop?: keyof T | null; value?: T | string | number | null },
  ): WorkNode<T> {
    if (isNil(options)) {
      throw new Error(`The <options> parameter is required. Received ${options}`);
    }
    if (isEmpty(options)) {
      throw new Error(
        `The <options> parameter is an object or value with length 0. Received ${options}`,
      );
    }

    const { prop, value } = options;

    if (prop && !value) {
      throw new Error(`Found parameter <options>.prop=${prop} but <options>.value is null.`);
    }
    if (!prop && value) {
      if (head.value === value) {
        return head;
      }
    }
    if (head.value[`${prop}`] === value) {
      return head;
    }
    if (!head.next) {
      throw new Error('Finished traversing the linked list. No WorkNode found.');
    }
    return this.findWorkNode(head.next, options);
  }
}
