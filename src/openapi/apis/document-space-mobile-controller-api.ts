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


import globalAxios, { AxiosPromise, AxiosInstance } from 'axios';
import { Configuration } from '../configuration';
// Some imports not used depending on template conditions
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError } from '../base';
// @ts-ignore
import { DocumentSpaceMobileResponseDto } from '../models';
// @ts-ignore
import { ExceptionResponse } from '../models';
// @ts-ignore
import { S3MobilePaginationDto } from '../models';
/**
 * DocumentSpaceMobileControllerApi - axios parameter creator
 * @export
 */
export const DocumentSpaceMobileControllerApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Lists folders and files contained within given folder path - one level deep (does not recurse into any sub-folders).  Intended for mobile usage since it included favorites indication as well
         * @summary List folders and files at given path - with favorites indicator included
         * @param {string} id 
         * @param {string} [path] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        dumpContentsAtPath1: async (id: string, path?: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            if (id === null || id === undefined) {
                throw new RequiredError('id','Required parameter id was null or undefined when calling dumpContentsAtPath1.');
            }
            const localVarPath = `/v2/document-space-mobile/spaces/{id}/contents`
                .replace(`{${"id"}}`, encodeURIComponent(String(id)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, 'https://example.com');
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (path !== undefined) {
                localVarQueryParameter['path'] = path;
            }


    
            const queryParameters = new URLSearchParams(localVarUrlObj.search);
            for (const key in localVarQueryParameter) {
                queryParameters.set(key, localVarQueryParameter[key]);
            }
            for (const key in options.query) {
                queryParameters.set(key, options.query[key]);
            }
            localVarUrlObj.search = (new URLSearchParams(queryParameters)).toString();
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Retrieves all document spaces that the requesting user can access, and their default space (if any)
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getSpacesAvailableAndDefault: async (options: any = {}): Promise<RequestArgs> => {
            const localVarPath = `/v2/document-space-mobile/spaces`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, 'https://example.com');
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            const queryParameters = new URLSearchParams(localVarUrlObj.search);
            for (const key in localVarQueryParameter) {
                queryParameters.set(key, localVarQueryParameter[key]);
            }
            for (const key in options.query) {
                queryParameters.set(key, options.query[key]);
            }
            localVarUrlObj.search = (new URLSearchParams(queryParameters)).toString();
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * DocumentSpaceMobileControllerApi - functional programming interface
 * @export
 */
export const DocumentSpaceMobileControllerApiFp = function(configuration?: Configuration) {
    return {
        /**
         * Lists folders and files contained within given folder path - one level deep (does not recurse into any sub-folders).  Intended for mobile usage since it included favorites indication as well
         * @summary List folders and files at given path - with favorites indicator included
         * @param {string} id 
         * @param {string} [path] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async dumpContentsAtPath1(id: string, path?: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<S3MobilePaginationDto>> {
            const localVarAxiosArgs = await DocumentSpaceMobileControllerApiAxiosParamCreator(configuration).dumpContentsAtPath1(id, path, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: (configuration?.basePath || basePath) + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * 
         * @summary Retrieves all document spaces that the requesting user can access, and their default space (if any)
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getSpacesAvailableAndDefault(options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<DocumentSpaceMobileResponseDto>> {
            const localVarAxiosArgs = await DocumentSpaceMobileControllerApiAxiosParamCreator(configuration).getSpacesAvailableAndDefault(options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: (configuration?.basePath || basePath) + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
    }
};

/**
 * DocumentSpaceMobileControllerApi - factory interface
 * @export
 */
export const DocumentSpaceMobileControllerApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    return {
        /**
         * Lists folders and files contained within given folder path - one level deep (does not recurse into any sub-folders).  Intended for mobile usage since it included favorites indication as well
         * @summary List folders and files at given path - with favorites indicator included
         * @param {string} id 
         * @param {string} [path] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        dumpContentsAtPath1(id: string, path?: string, options?: any): AxiosPromise<S3MobilePaginationDto> {
            return DocumentSpaceMobileControllerApiFp(configuration).dumpContentsAtPath1(id, path, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Retrieves all document spaces that the requesting user can access, and their default space (if any)
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getSpacesAvailableAndDefault(options?: any): AxiosPromise<DocumentSpaceMobileResponseDto> {
            return DocumentSpaceMobileControllerApiFp(configuration).getSpacesAvailableAndDefault(options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * DocumentSpaceMobileControllerApi - interface
 * @export
 * @interface DocumentSpaceMobileControllerApi
 */
export interface DocumentSpaceMobileControllerApiInterface {
    /**
     * Lists folders and files contained within given folder path - one level deep (does not recurse into any sub-folders).  Intended for mobile usage since it included favorites indication as well
     * @summary List folders and files at given path - with favorites indicator included
     * @param {string} id 
     * @param {string} [path] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DocumentSpaceMobileControllerApiInterface
     */
    dumpContentsAtPath1(id: string, path?: string, options?: any): AxiosPromise<S3MobilePaginationDto>;

    /**
     * 
     * @summary Retrieves all document spaces that the requesting user can access, and their default space (if any)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DocumentSpaceMobileControllerApiInterface
     */
    getSpacesAvailableAndDefault(options?: any): AxiosPromise<DocumentSpaceMobileResponseDto>;

}

/**
 * DocumentSpaceMobileControllerApi - object-oriented interface
 * @export
 * @class DocumentSpaceMobileControllerApi
 * @extends {BaseAPI}
 */
export class DocumentSpaceMobileControllerApi extends BaseAPI implements DocumentSpaceMobileControllerApiInterface {
    /**
     * Lists folders and files contained within given folder path - one level deep (does not recurse into any sub-folders).  Intended for mobile usage since it included favorites indication as well
     * @summary List folders and files at given path - with favorites indicator included
     * @param {string} id 
     * @param {string} [path] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DocumentSpaceMobileControllerApi
     */
    public dumpContentsAtPath1(id: string, path?: string, options?: any) {
        return DocumentSpaceMobileControllerApiFp(this.configuration).dumpContentsAtPath1(id, path, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Retrieves all document spaces that the requesting user can access, and their default space (if any)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DocumentSpaceMobileControllerApi
     */
    public getSpacesAvailableAndDefault(options?: any) {
        return DocumentSpaceMobileControllerApiFp(this.configuration).getSpacesAvailableAndDefault(options).then((request) => request(this.axios, this.basePath));
    }
}
