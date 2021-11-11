import { State } from '@hookstate/core';
import { prepareRequestError } from '../../utils/ErrorHandling/error-handling-utils';
import { GlobalStateService } from './global-state-service';

/**
 * Interface for a Service that is using Global hookstate values.
 */
export abstract class AbstractGlobalStateService<T> implements GlobalStateService {
  constructor(public state: State<T>) {

  }

  abstract resetState(): void;

  get isPromised() {
    return this.state.promised;
  }

  get error() {
    if (this.isPromised || !this.state.error) {
      return undefined;
    }

    return prepareRequestError(this.state.error);
  }

  get isStateReady() {
    return !this.isPromised && !this.error;
  }
}
