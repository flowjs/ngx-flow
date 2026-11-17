import type { FlowInstance, FlowOptions } from './flow-js';

export type FlowConstructor = new (
  flowOptions?: FlowOptions
) => FlowInstance;
