import { LinkedList } from "./src";

const linkedList = LinkedList.of<any>();

console.log(
  linkedList,
  linkedList.head,
  linkedList.size,
  linkedList.addNodeToHead
);
