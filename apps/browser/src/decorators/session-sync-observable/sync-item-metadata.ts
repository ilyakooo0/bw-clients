export interface SyncedItemMetadata {
  key: string;
  ctor?: new (...args: any) => any;
  initializer?: (key_value_pair: any) => any;
}
