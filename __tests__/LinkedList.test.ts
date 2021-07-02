import { LinkedList } from '../src/LinkedList';
import { WorkNode } from '../src/WorkNode';

describe('LinkedList.of()', () => {
  it('Should return a LinkedList instance', () => {
    const linkedList = LinkedList.of<any>();

    expect(linkedList).toBeInstanceOf(LinkedList);
    expect(linkedList.size).toBe<any>(0);
    expect(linkedList.head).toBeUndefined();
  });
});

describe('LinkedList.addNodeToHead()', () => {
  it('Should add a new WorkNode to head if called with an argument of type number', () => {
    const linkedList = LinkedList.of<number>();

    const newList = linkedList.addNodeToHead(1);

    expect(newList.size).toBe<number>(1);
    expect(newList.head).toBeInstanceOf(WorkNode);
    expect(newList.head.value).toBe<number>(1);
  });
});

describe('LinkedList.findWorkNode()', () => {
  it('Should find a WorkNode if called with { value: number }', () => {
    const linkedList = LinkedList.of<number>().addNodeToHead(1);

    const workNode = linkedList.findWorkNode(linkedList.head, { value: 1 });

    expect(linkedList.head.value).toBe<number>(1);
    expect(workNode).toBeTruthy();
    expect(workNode.value).toBe<number>(1);
    expect(workNode).toBeInstanceOf(WorkNode);
  });

  it('Should find a WorkNode where WorkNode.value is equal to <options>.<value>', () => {
    const linkedList = LinkedList.of<number>().addNodeToHead(1).addNodeToHead(2).addNodeToHead(3);

    const workNode = linkedList.findWorkNode(linkedList.head, { value: 2 });

    expect(workNode.value).toBe(2);
    expect(workNode.next.value).toBe(1);
    expect(workNode.next.next).toBeNull();
  });

  it('Should find a WorkNode where WorkNode.value[<prop>] is equal to <options>.<value>', () => {
    interface CustomNode {
      id: string;
      name: string;
    }
    const linkedList = LinkedList.of<CustomNode>()
      .addNodeToHead({
        id: '1',
        name: 'Test 1',
      })
      .addNodeToHead({
        id: '2',
        name: 'Test 2',
      })
      .addNodeToHead({
        id: '1',
        name: 'Test 3',
      });

    const workNode = linkedList.findWorkNode(linkedList.head, { prop: 'id', value: '2' });

    expect(workNode.value.id).toBe('2');
    expect(workNode.value.name).toBe('Test 2');
    expect(workNode.next.value.id).toBe('1');
    expect(workNode.next.value.name).toBe('Test 1');
    expect(workNode.next.next).toBeNull();
  });

  it('Should throw an error if the <options> argument is undefined or null', () => {
    const linkedList = LinkedList.of<any>();

    const undefinedCall = () => linkedList.findWorkNode(linkedList.head, undefined);
    const nullCall = () => linkedList.findWorkNode(linkedList.head, null);

    expect(undefinedCall).toThrowError(
      `The <options> parameter is required. Received ${undefined}`,
    );
    expect(nullCall).toThrowError(`The <options> parameter is required. Received ${null}`);
  });

  it('Should throw an error if the <options> argument is empty object or value with length 0', () => {
    const linkedList = LinkedList.of<any>();

    const emptyObjCall = () => linkedList.findWorkNode(linkedList.head, {});

    expect(emptyObjCall).toThrowError(
      `The <options> parameter is an object or value with length 0. Received ${{}}`,
    );
  });

  it('Should throw an error if the <options> object argument contains only the <prop> property', () => {
    const linkedList = LinkedList.of<any>();
    const prop = 'id';

    const callWithError = () => linkedList.findWorkNode(linkedList.head, { prop });

    expect(callWithError).toThrowError(
      `Found parameter <options>.prop=${prop} but <options>.value is null.`,
    );
  });
});
