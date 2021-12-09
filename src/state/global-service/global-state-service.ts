import RequestError from '../../utils/ErrorHandling/request-error';

export interface GlobalStateService {
  isPromised: boolean;
  error: RequestError | undefined;
  resetState: () => void;
  isStateReady: boolean;
}