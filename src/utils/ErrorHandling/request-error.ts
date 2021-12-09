interface RequestErrorParams {
  status?: number;
  error?: string;
  message: string;
}

export default class RequestError {
  constructor(params: RequestErrorParams) {
    this._status = params.status;
    this._error = params.error;
    this._message = params.message;
  }

  private _status?: number;
  private _error?: string;
  private _message: string;

  get status(): number | undefined {
    return this._status;
  }

  get error(): string | undefined {
    return this._error;
  }

  get message(): string {
    return this._message;
  }
}