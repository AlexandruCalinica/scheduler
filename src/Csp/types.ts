export type MessageState = 'continue' | 'park' | 'wait';
export type Message = [MessageState, any];
export type ChannelReturnType = {
  name: string;
  result: Array<ChannelReturnType | any>;
  errors: Array<any>;
  store: Record<string, any>;
};
export type ChannelFunctionValue = (prev: any) => any;
export type ChannelValues = ChannelPrimitiveValue | ChannelFunctionValue;
export type Chan = {
  name: string;
  body: Array<any>;
  store: Record<string, any>;
  record: Array<any>;
};
export type ChannelPrimitiveValue = string | number | boolean | Array<any> | Record<any, any>;
export type YieldWrapper = {
  key: string;
  value: any;
  store: Record<string, any>;
  isChannel: boolean;
};
export enum InternalOperatorFunction {
  put = '__put__',
  putAt = '__putAt__',
  putFirst = '__putFirst__',
}
export type ChannelError = { message: string; location: string };
