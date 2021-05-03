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


import { BadRequestExceptionCause } from './bad-request-exception-cause';
import { BadRequestExceptionCauseStackTrace } from './bad-request-exception-cause-stack-trace';
import { BadRequestExceptionCauseSuppressed } from './bad-request-exception-cause-suppressed';

/**
 * 
 * @export
 * @interface BadRequestException
 */
export interface BadRequestException {
    /**
     * 
     * @type {BadRequestExceptionCause}
     * @memberof BadRequestException
     */
    cause?: BadRequestExceptionCause;
    /**
     * 
     * @type {Array<BadRequestExceptionCauseStackTrace>}
     * @memberof BadRequestException
     */
    stackTrace?: Array<BadRequestExceptionCauseStackTrace>;
    /**
     * 
     * @type {string}
     * @memberof BadRequestException
     */
    message?: string;
    /**
     * 
     * @type {Array<BadRequestExceptionCauseSuppressed>}
     * @memberof BadRequestException
     */
    suppressed?: Array<BadRequestExceptionCauseSuppressed>;
    /**
     * 
     * @type {string}
     * @memberof BadRequestException
     */
    localizedMessage?: string;
}


