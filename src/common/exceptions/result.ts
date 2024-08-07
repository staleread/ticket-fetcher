export type ErrorResult = { message: string; code: number };

export class Result<T> {
  constructor(
    private value?: T,
    private error?: ErrorResult,
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

  getValue(): T {
    if (this.value === undefined) {
      throw new Error('Cannot retrieve the value of failure');
    }

    return this.value;
  }

  getError(): ErrorResult {
    if (this.error === undefined) {
      throw new Error('Cannot retrieve the error from successful result');
    }

    return this.error;
  }

  isSuccess() {
    return this.error === undefined;
  }

  isFailure() {
    return !this.isSuccess();
  }
}
