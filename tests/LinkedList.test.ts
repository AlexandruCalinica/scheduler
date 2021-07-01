import { LinkedList } from "../src/LinkedList";
import { WorkNode } from "../src/WorkNode";

describe("LinkedList Consumer", () => {
  it("Should be able to return a LinkedList instance by calling static method .of()", () => {
    const linkedList = LinkedList.of<any>();

    expect(linkedList).toBeInstanceOf(LinkedList);
    expect(linkedList.size).toBe(0);
    expect(linkedList.head).toBe(undefined);
  });

  it("Should be able to add a new WorkNode to head by calling .addNodeToHead() with an argument of type any", () => {
    const linkedList = LinkedList.of<number>();

    const newList = linkedList.addNodeToHead(1);

    expect(newList.size).toBe(1);
    expect(newList.head).toBeInstanceOf(WorkNode);
    expect(newList.head.value).toBe(1);
  });
});
