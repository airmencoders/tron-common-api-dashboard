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
 * @interface DocumentSpaceDashboardMemberRequestDto
 */
export interface DocumentSpaceDashboardMemberRequestDto {
    /**
     * 
     * @type {string}
     * @memberof DocumentSpaceDashboardMemberRequestDto
     */
    email: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof DocumentSpaceDashboardMemberRequestDto
     */
    privileges: Array<DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum>;
    /**
     * 
     * @type {string}
     * @memberof DocumentSpaceDashboardMemberRequestDto
     */
    name?: string;
}

/**
    * @export
    * @enum {string}
    */
export enum DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum {
    Write = 'WRITE',
    Membership = 'MEMBERSHIP'
}



