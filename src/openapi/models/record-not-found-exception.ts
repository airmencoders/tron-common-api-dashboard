/* tslint:disable */
/* eslint-disable */
/**
 * TRON Common API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.0.1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import { RecordNotFoundExceptionCause } from './record-not-found-exception-cause';
import { RecordNotFoundExceptionCauseStackTrace } from './record-not-found-exception-cause-stack-trace';
import { RecordNotFoundExceptionCauseSuppressed } from './record-not-found-exception-cause-suppressed';

/**
 * 
 * @export
 * @interface RecordNotFoundException
 */
export interface RecordNotFoundException {
    /**
     * 
     * @type {RecordNotFoundExceptionCause}
     * @memberof RecordNotFoundException
     */
    cause?: RecordNotFoundExceptionCause;
    /**
     * 
     * @type {Array<RecordNotFoundExceptionCauseStackTrace>}
     * @memberof RecordNotFoundException
     */
    stackTrace?: Array<RecordNotFoundExceptionCauseStackTrace>;
    /**
     * 
     * @type {string}
     * @memberof RecordNotFoundException
     */
    message?: string;
    /**
     * 
     * @type {Array<RecordNotFoundExceptionCauseSuppressed>}
     * @memberof RecordNotFoundException
     */
    suppressed?: Array<RecordNotFoundExceptionCauseSuppressed>;
    /**
     * 
     * @type {string}
     * @memberof RecordNotFoundException
     */
    localizedMessage?: string;
}


