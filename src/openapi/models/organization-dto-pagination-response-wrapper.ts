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


import { OrganizationDto } from './organization-dto';
import { Pagination } from './pagination';

/**
 * 
 * @export
 * @interface OrganizationDtoPaginationResponseWrapper
 */
export interface OrganizationDtoPaginationResponseWrapper {
    /**
     * 
     * @type {Array<OrganizationDto>}
     * @memberof OrganizationDtoPaginationResponseWrapper
     */
    data: Array<OrganizationDto>;
    /**
     * 
     * @type {Pagination}
     * @memberof OrganizationDtoPaginationResponseWrapper
     */
    pagination: Pagination;
}


