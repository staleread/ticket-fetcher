export class Result<T> {
  constructor(
    private _value?: T,
    private _error?: string,
  ) {}

  static success<T>(value: T) {
    return new Result(value, undefined);
  }

  static failure(error: string) {
    return new Result<any>(undefined, error);
  }

  get value(): T {
    if (this._value === undefined) {
      throw new Error('Cannot retrieve the value of failure');
    }

    return this._value;
  }

  get error(): string {
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
