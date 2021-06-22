import { ResponseType } from './response-type';

/**
 * Interface used to hold the result of a Patch operation.
 * Main use case is to handle partial update failures
 * as opposed to strictly success / failure.
 * 
 * @type {T} the data type of the response
 */
export interface PatchResponse<T> {
  type: ResponseType,
  data?: T,
  errors?: Error[]
}