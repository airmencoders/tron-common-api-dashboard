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
 * @interface PersonDto
 */
export interface PersonDto {
    /**
     * 
     * @type {string}
     * @memberof PersonDto
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof PersonDto
     */
    firstName?: string;
    /**
     * 
     * @type {string}
     * @memberof PersonDto
     */
    middleName?: string;
    /**
     * 
     * @type {string}
     * @memberof PersonDto
     */
    lastName?: string;
    /**
     * 
     * @type {string}
     * @memberof PersonDto
     */
    title?: string;
    /**
     * 
     * @type {string}
     * @memberof PersonDto
     */
    email?: string;
    /**
     * 
     * @type {string}
     * @memberof PersonDto
     */
    dodid?: string;
    /**
     * 
     * @type {string}
     * @memberof PersonDto
     */
    rank?: string;
    /**
     * 
     * @type {string}
     * @memberof PersonDto
     */
    branch?: PersonDtoBranchEnum;
    /**
     * 
     * @type {string}
     * @memberof PersonDto
     */
    phone?: string;
    /**
     * 
     * @type {string}
     * @memberof PersonDto
     */
    address?: string;
    /**
     * 
     * @type {string}
     * @memberof PersonDto
     */
    dutyPhone?: string;
    /**
     * 
     * @type {string}
     * @memberof PersonDto
     */
    dutyTitle?: string;
    /**
     * 
     * @type {Set<string>}
     * @memberof PersonDto
     */
    organizationMemberships?: Set<string>;
    /**
     * 
     * @type {Set<string>}
     * @memberof PersonDto
     */
    organizationLeaderships?: Set<string>;
}

/**
    * @export
    * @enum {string}
    */
export enum PersonDtoBranchEnum {
    Other = 'OTHER',
    Usa = 'USA',
    Usaf = 'USAF',
    Usmc = 'USMC',
    Usn = 'USN',
    Ussf = 'USSF',
    Uscg = 'USCG'
}



