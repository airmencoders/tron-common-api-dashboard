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
 * @interface DocumentMobileDto
 */
export interface DocumentMobileDto {
    /**
     * 
     * @type {string}
     * @memberof DocumentMobileDto
     */
    key: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentMobileDto
     */
    path: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentMobileDto
     */
    spaceId: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentMobileDto
     */
    spaceName?: string;
    /**
     * Size in bytes
     * @type {number}
     * @memberof DocumentMobileDto
     */
    size: number;
    /**
     * 
     * @type {string}
     * @memberof DocumentMobileDto
     */
    lastModifiedDate: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentMobileDto
     */
    lastModifiedBy: string;
    /**
     * 
     * @type {boolean}
     * @memberof DocumentMobileDto
     */
    hasContents?: boolean;
    /**
     * 
     * @type {string}
     * @memberof DocumentMobileDto
     */
    lastActivity?: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentMobileDto
     */
    elementUniqueId?: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentMobileDto
     */
    parentId?: string;
    /**
     * 
     * @type {boolean}
     * @memberof DocumentMobileDto
     */
    favorite?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof DocumentMobileDto
     */
    folder?: boolean;
}


