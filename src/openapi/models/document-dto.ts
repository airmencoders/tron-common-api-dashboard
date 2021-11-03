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
 * @interface DocumentDto
 */
export interface DocumentDto {
    /**
     * 
     * @type {string}
     * @memberof DocumentDto
     */
    key: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentDto
     */
    path: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentDto
     */
    spaceId: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentDto
     */
    spaceName?: string;
    /**
     * Size in bytes
     * @type {number}
     * @memberof DocumentDto
     */
    size: number;
    /**
     * 
     * @type {string}
     * @memberof DocumentDto
     */
    lastModifiedDate: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentDto
     */
    lastModifiedBy: string;
    /**
     * 
     * @type {boolean}
     * @memberof DocumentDto
     */
    folder?: boolean;
}


