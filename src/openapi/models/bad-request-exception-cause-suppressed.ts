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


import { BadRequestExceptionCauseStackTrace } from './bad-request-exception-cause-stack-trace';

/**
 * 
 * @export
 * @interface BadRequestExceptionCauseSuppressed
 */
export interface BadRequestExceptionCauseSuppressed {
    /**
     * 
     * @type {Array<BadRequestExceptionCauseStackTrace>}
     * @memberof BadRequestExceptionCauseSuppressed
     */
    stackTrace?: Array<BadRequestExceptionCauseStackTrace>;
    /**
     * 
     * @type {string}
     * @memberof BadRequestExceptionCauseSuppressed
     */
    message?: string;
    /**
     * 
     * @type {string}
     * @memberof BadRequestExceptionCauseSuppressed
     */
    localizedMessage?: string;
}


