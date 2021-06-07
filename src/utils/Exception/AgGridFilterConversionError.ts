export class AgGridFilterConversionError extends Error {
  constructor(message?: string) {
    super(message ?? 'Something went wrong trying to filter the data!');

    Object.setPrototypeOf(this, AgGridFilterConversionError.prototype);
  }
}