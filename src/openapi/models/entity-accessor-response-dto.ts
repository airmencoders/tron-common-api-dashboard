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


import { EntityAccessorDto } from './entity-accessor-dto';

/**
 * 
 * @export
 * @interface EntityAccessorResponseDto
 */
export interface EntityAccessorResponseDto {
    /**
     * 
     * @type {string}
     * @memberof EntityAccessorResponseDto
     */
    startDate?: string;
    /**
     * 
     * @type {string}
     * @memberof EntityAccessorResponseDto
     */
    endDate?: string;
    /**
     * 
     * @type {Array<EntityAccessorDto>}
     * @memberof EntityAccessorResponseDto
     */
    entityAccessors?: Array<EntityAccessorDto>;
}


