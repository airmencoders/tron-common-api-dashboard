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
 * 
 * @export
 * @interface JsonPatchStringValue
 */
export interface JsonPatchStringValue {
    /**
     * 
     * @type {string}
     * @memberof JsonPatchStringValue
     */
    op?: JsonPatchStringValueOpEnum;
    /**
     * 
     * @type {string}
     * @memberof JsonPatchStringValue
     */
    path?: string;
    /**
     * 
     * @type {string}
     * @memberof JsonPatchStringValue
     */
    value?: string;
}

/**
    * @export
    * @enum {string}
    */
export enum JsonPatchStringValueOpEnum {
    Add = 'add',
    Remove = 'remove',
    Replace = 'replace',
    Copy = 'copy',
    Move = 'move',
    Test = 'test'
}



