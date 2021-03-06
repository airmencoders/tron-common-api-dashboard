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
 * @interface EventInfoDto
 */
export interface EventInfoDto {
    /**
     * 
     * @type {string}
     * @memberof EventInfoDto
     */
    eventType?: EventInfoDtoEventTypeEnum;
    /**
     * 
     * @type {number}
     * @memberof EventInfoDto
     */
    eventCount?: number;
}

/**
    * @export
    * @enum {string}
    */
export enum EventInfoDtoEventTypeEnum {
    PersonChange = 'PERSON_CHANGE',
    PersonDelete = 'PERSON_DELETE',
    OrganizationChange = 'ORGANIZATION_CHANGE',
    OrganizationDelete = 'ORGANIZATION_DELETE',
    PersonOrgAdd = 'PERSON_ORG_ADD',
    PersonOrgRemove = 'PERSON_ORG_REMOVE',
    SubOrgAdd = 'SUB_ORG_ADD',
    SubOrgRemove = 'SUB_ORG_REMOVE'
}



