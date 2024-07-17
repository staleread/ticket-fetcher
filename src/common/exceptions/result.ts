export type ErrorResult = { message: string; code: number };

export class Result<T> {
  constructor(
    private _value?: T,
    private _error?: ErrorResult,
  ) {}

  static success<T>(value: T): Result<T> {
    return new Result(value, undefined);
  }

  static failure(message: string, code: number): Result<any> {
    return new Result<any>(undefined, { message, code });
  }

  static fromFailure(errorResult: ErrorResult): Result<any> {
    return new Result<any>(undefined, errorResult);
  }

  get value(): T {
    if (this._value === undefined) {
      throw new Error('Cannot retrieve the value of failure');
    }

    return this._value;
  }

  get error(): ErrorResult {
    if (this._error === undefined) {
      throw new Error('Cannot retrieve the error from successful result');
    }

    return this._error;
  }

  isSuccess() {
    return this._error === undefined;
  }

  isFailure() {
    return !this.isSuccess();
  }
}
