export class WorkNode<T> {
  value: T;
  next: WorkNode<T> | null;

  constructor(value: T, next: WorkNode<T> | null = null) {
    this.value = value;
    this.next = next;
  }

  public static of<T>(value: T, next: WorkNode<T> | null): WorkNode<T> {
    return new WorkNode<T>(value, next);
  }
}
