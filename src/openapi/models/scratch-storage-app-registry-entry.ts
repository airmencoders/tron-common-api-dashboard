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


import { ScratchStorageAppUserPriv } from './scratch-storage-app-user-priv';

/**
 * 
 * @export
 * @interface ScratchStorageAppRegistryEntry
 */
export interface ScratchStorageAppRegistryEntry {
    /**
     * 
     * @type {string}
     * @memberof ScratchStorageAppRegistryEntry
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof ScratchStorageAppRegistryEntry
     */
    appName: string;
    /**
     * 
     * @type {boolean}
     * @memberof ScratchStorageAppRegistryEntry
     */
    appHasImplicitRead?: boolean;
    /**
     * 
     * @type {Set<ScratchStorageAppUserPriv>}
     * @memberof ScratchStorageAppRegistryEntry
     */
    userPrivs?: Set<ScratchStorageAppUserPriv>;
}


