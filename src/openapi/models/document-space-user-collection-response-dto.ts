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


import { DocumentMetadata } from './document-metadata';

/**
 * 
 * @export
 * @interface DocumentSpaceUserCollectionResponseDto
 */
export interface DocumentSpaceUserCollectionResponseDto {
    /**
     * 
     * @type {string}
     * @memberof DocumentSpaceUserCollectionResponseDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentSpaceUserCollectionResponseDto
     */
    itemId: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentSpaceUserCollectionResponseDto
     */
    documentSpaceId: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentSpaceUserCollectionResponseDto
     */
    key: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentSpaceUserCollectionResponseDto
     */
    parentId?: string;
    /**
     * 
     * @type {string}
     * @memberof DocumentSpaceUserCollectionResponseDto
     */
    lastModifiedDate: string;
    /**
     * 
     * @type {DocumentMetadata}
     * @memberof DocumentSpaceUserCollectionResponseDto
     */
    metadata: DocumentMetadata;
    /**
     * 
     * @type {boolean}
     * @memberof DocumentSpaceUserCollectionResponseDto
     */
    folder?: boolean;
}


