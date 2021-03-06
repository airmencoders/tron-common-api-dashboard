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
 * @interface OrganizationDto
 */
export interface OrganizationDto {
    /**
     * 
     * @type {string}
     * @memberof OrganizationDto
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof OrganizationDto
     */
    leader?: string | null;
    /**
     * Field cannot be modified through JSON Patch
     * @type {Array<string>}
     * @memberof OrganizationDto
     */
    members?: Array<string>;
    /**
     * 
     * @type {string}
     * @memberof OrganizationDto
     */
    parentOrganization?: string | null;
    /**
     * Field cannot be modified through JSON Patch
     * @type {Array<string>}
     * @memberof OrganizationDto
     */
    subordinateOrganizations?: Array<string>;
    /**
     * 
     * @type {string}
     * @memberof OrganizationDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof OrganizationDto
     */
    orgType?: OrganizationDtoOrgTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof OrganizationDto
     */
    branchType?: OrganizationDtoBranchTypeEnum;
}

/**
    * @export
    * @enum {string}
    */
export enum OrganizationDtoOrgTypeEnum {
    Squadron = 'SQUADRON',
    Group = 'GROUP',
    Flight = 'FLIGHT',
    Wing = 'WING',
    OtherUsaf = 'OTHER_USAF',
    Division = 'DIVISION',
    Regiment = 'REGIMENT',
    Brigade = 'BRIGADE',
    Battalion = 'BATTALION',
    Company = 'COMPANY',
    Troop = 'TROOP',
    OtherUsa = 'OTHER_USA',
    OtherUsn = 'OTHER_USN',
    OtherUssf = 'OTHER_USSF',
    OtherUscg = 'OTHER_USCG',
    OtherUsmc = 'OTHER_USMC',
    Organization = 'ORGANIZATION'
}
/**
    * @export
    * @enum {string}
    */
export enum OrganizationDtoBranchTypeEnum {
    Other = 'OTHER',
    Usa = 'USA',
    Usaf = 'USAF',
    Usmc = 'USMC',
    Usn = 'USN',
    Ussf = 'USSF',
    Uscg = 'USCG'
}



