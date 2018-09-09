import { InjectionToken } from '@angular/core';
import { FlowConstructor } from './flow/flow';

export const FlowInjectionToken = new InjectionToken<FlowConstructor>('Flow');
