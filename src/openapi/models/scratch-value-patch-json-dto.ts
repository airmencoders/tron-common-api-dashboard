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



/**
 * Object specifying the json path to execute and the new value
 * @export
 * @interface ScratchValuePatchJsonDto
 */
export interface ScratchValuePatchJsonDto {
    /**
     * 
     * @type {string}
     * @memberof ScratchValuePatchJsonDto
     */
    jsonPath: string;
    /**
     * 
     * @type {string}
     * @memberof ScratchValuePatchJsonDto
     */
    value?: string;
    /**
     * 
     * @type {string}
     * @memberof ScratchValuePatchJsonDto
     */
    newFieldName?: string;
    /**
     * 
     * @type {boolean}
     * @memberof ScratchValuePatchJsonDto
     */
    newEntry?: boolean;
}


