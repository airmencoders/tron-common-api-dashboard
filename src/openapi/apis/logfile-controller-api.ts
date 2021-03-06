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
import { ExceptionResponse } from '../models';
// @ts-ignore
import { LogfileDto } from '../models';
/**
 * LogfileControllerApi - axios parameter creator
 * @export
 */
export const LogfileControllerApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Retrieves a logfile for download
         * @summary Retrieves a logfile for download
         * @param {string} fileName 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getLogfile: async (fileName: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'fileName' is not null or undefined
            if (fileName === null || fileName === undefined) {
                throw new RequiredError('fileName','Required parameter fileName was null or undefined when calling getLogfile.');
            }
            const localVarPath = `/v2/logfile/{fileName}`
                .replace(`{${"fileName"}}`, encodeURIComponent(String(fileName)));
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
        /**
         * Retrieves all logfiles available for download
         * @summary Retrieves all logfiles info
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getLogfileInfo: async (options: any = {}): Promise<RequestArgs> => {
            const localVarPath = `/v2/logfile`;
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
 * LogfileControllerApi - functional programming interface
 * @export
 */
export const LogfileControllerApiFp = function(configuration?: Configuration) {
    return {
        /**
         * Retrieves a logfile for download
         * @summary Retrieves a logfile for download
         * @param {string} fileName 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getLogfile(fileName: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<any>> {
            const localVarAxiosArgs = await LogfileControllerApiAxiosParamCreator(configuration).getLogfile(fileName, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: (configuration?.basePath || basePath) + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * Retrieves all logfiles available for download
         * @summary Retrieves all logfiles info
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getLogfileInfo(options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Array<LogfileDto>>> {
            const localVarAxiosArgs = await LogfileControllerApiAxiosParamCreator(configuration).getLogfileInfo(options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: (configuration?.basePath || basePath) + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
    }
};

/**
 * LogfileControllerApi - factory interface
 * @export
 */
export const LogfileControllerApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    return {
        /**
         * Retrieves a logfile for download
         * @summary Retrieves a logfile for download
         * @param {string} fileName 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getLogfile(fileName: string, options?: any): AxiosPromise<any> {
            return LogfileControllerApiFp(configuration).getLogfile(fileName, options).then((request) => request(axios, basePath));
        },
        /**
         * Retrieves all logfiles available for download
         * @summary Retrieves all logfiles info
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getLogfileInfo(options?: any): AxiosPromise<Array<LogfileDto>> {
            return LogfileControllerApiFp(configuration).getLogfileInfo(options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * LogfileControllerApi - interface
 * @export
 * @interface LogfileControllerApi
 */
export interface LogfileControllerApiInterface {
    /**
     * Retrieves a logfile for download
     * @summary Retrieves a logfile for download
     * @param {string} fileName 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof LogfileControllerApiInterface
     */
    getLogfile(fileName: string, options?: any): AxiosPromise<any>;

    /**
     * Retrieves all logfiles available for download
     * @summary Retrieves all logfiles info
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof LogfileControllerApiInterface
     */
    getLogfileInfo(options?: any): AxiosPromise<Array<LogfileDto>>;

}

/**
 * LogfileControllerApi - object-oriented interface
 * @export
 * @class LogfileControllerApi
 * @extends {BaseAPI}
 */
export class LogfileControllerApi extends BaseAPI implements LogfileControllerApiInterface {
    /**
     * Retrieves a logfile for download
     * @summary Retrieves a logfile for download
     * @param {string} fileName 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof LogfileControllerApi
     */
    public getLogfile(fileName: string, options?: any) {
        return LogfileControllerApiFp(this.configuration).getLogfile(fileName, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Retrieves all logfiles available for download
     * @summary Retrieves all logfiles info
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof LogfileControllerApi
     */
    public getLogfileInfo(options?: any) {
        return LogfileControllerApiFp(this.configuration).getLogfileInfo(options).then((request) => request(this.axios, this.basePath));
    }
}
