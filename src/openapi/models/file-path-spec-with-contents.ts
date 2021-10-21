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


import { DocumentSpaceFileSystemEntry } from './document-space-file-system-entry';

/**
 * 
 * @export
 * @interface FilePathSpecWithContents
 */
export interface FilePathSpecWithContents {
    /**
     * 
     * @type {string}
     * @memberof FilePathSpecWithContents
     */
    parentFolderId?: string;
    /**
     * 
     * @type {string}
     * @memberof FilePathSpecWithContents
     */
    fullPathSpec?: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof FilePathSpecWithContents
     */
    uuidList?: Array<string>;
    /**
     * 
     * @type {string}
     * @memberof FilePathSpecWithContents
     */
    documentSpaceId: string;
    /**
     * 
     * @type {string}
     * @memberof FilePathSpecWithContents
     */
    itemId: string;
    /**
     * 
     * @type {string}
     * @memberof FilePathSpecWithContents
     */
    itemName: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof FilePathSpecWithContents
     */
    files?: Array<string>;
    /**
     * 
     * @type {Array<DocumentSpaceFileSystemEntry>}
     * @memberof FilePathSpecWithContents
     */
    subFolderElements?: Array<DocumentSpaceFileSystemEntry>;
    /**
     * 
     * @type {string}
     * @memberof FilePathSpecWithContents
     */
    docSpaceQualifiedPath?: string;
}


