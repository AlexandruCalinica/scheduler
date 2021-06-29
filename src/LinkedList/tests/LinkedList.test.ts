import { mocked } from "ts-jest/utils";
import { LinkedList } from "../LinkedList";

jest.mock("../LinkedList");
const MockedLinkedList = mocked(LinkedList, true);

describe("LinkedList Consumer", () => {
  beforeEach(() => {
    MockedLinkedList.mockClear();
  });

  LinkedList.of<any>();

  it("Should be able to call .of() on LinkedList", () => {
    expect(MockedLinkedList.of).toHaveBeenCalledTimes(1);
  });

  it("Should be able to call new() on the LinkedList constructor", () => {
    new LinkedList<any>();
    expect(MockedLinkedList).toHaveBeenCalledTimes(1);
  });

  it("Should be able to return a LinkedList instance after calling .of()", () => {
    expect(MockedLinkedList.of.mock.instances).toHaveLength(1);
  });

  it("Should be able to return a LinkedList instance after calling new()", () => {
    expect(new LinkedList<any>()).toBeTruthy();
  });
});
