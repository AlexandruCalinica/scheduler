import { WorkNode } from '../src/WorkNode';

describe('WorkNode.of()', () => {
  it('Should return an instance of WorkNode', () => {
    const workNode = WorkNode.of<any>(1);

    expect(workNode).toBeInstanceOf(WorkNode);
    expect(workNode.value).toBe(1);
    expect(workNode.next).toBe(null);
  });

  it('Should return an instance of WorkNode with value of type {...}', () => {
    interface CustomNode {
      id: string;
      name: string;
      age: number;
      tags: string[];
      numbers: number[];
      references: CustomNode[];
    }
    const mockData: CustomNode = {
      id: 'asdkj123',
      name: 'Test Node',
      age: 28,
      tags: ['tag1', 'tag2', 'tag3'],
      numbers: [1, 2, 3, 4, 5],
      references: [
        {
          id: 'newIdasd',
          name: 'Reference Test Node',
          age: 29,
          tags: ['tag4', 'tag5', 'tag6'],
          numbers: [1, 2, 3],
          references: [],
        },
      ],
    };

    const workNode = WorkNode.of<CustomNode>(mockData);

    expect(workNode.value).toBe<CustomNode>(mockData);
    expect(workNode.next).toBeNull();
  });
});
