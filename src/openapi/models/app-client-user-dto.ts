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


import { Privilege } from './privilege';

/**
 * 
 * @export
 * @interface AppClientUserDto
 */
export interface AppClientUserDto {
    /**
     * 
     * @type {string}
     * @memberof AppClientUserDto
     */
    id?: string;
    /**
     * 
     * @type {Array<Privilege>}
     * @memberof AppClientUserDto
     */
    privileges?: Array<Privilege>;
    /**
     * 
     * @type {string}
     * @memberof AppClientUserDto
     */
    name?: string;
}


