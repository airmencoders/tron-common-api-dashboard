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
import { HttpLogDtoPaginationResponseWrapper } from '../models';
// @ts-ignore
import { HttpLogEntryDetailsDto } from '../models';
/**
 * HttpLogsControllerApi - axios parameter creator
 * @export
 */
export const HttpLogsControllerApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Must have DASHBOARD_ADMIN privilege to access. This detailed info includes the request/response bodies (if present)
         * @summary Retrieves the full record of a particular request
         * @param {string} id 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getHttpLogDetails: async (id: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            if (id === null || id === undefined) {
                throw new RequiredError('id','Required parameter id was null or undefined when calling getHttpLogDetails.');
            }
            const localVarPath = `/v2/logs/{id}`
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
         * Must have DASHBOARD_ADMIN privilege to access.  Date time given is in the format \'yyyy-MM-ddTHH:mm:ss\' and should be in UTC time. This date time parameter is required.  This is also a pageable interface (using page and size query params).
         * @summary Retrieves a subset of the server http trace logs from a specified date
         * @param {string} fromDate The date/time from which to query from - format yyyy-MM-dd\&#39;T\&#39;HH:mm:ss - in UTC
         * @param {string} [method] HTTP method to filter on, e.g. GET, POST, etc
         * @param {string} [userName] Username to filter on
         * @param {number} [status] HTTP response status to sort on
         * @param {string} [userAgentContains] Filter by user agent containing given string
         * @param {string} [requestedUrlContains] Filter by requested url containing given string
         * @param {number} [page] Zero-based page index (0..N)
         * @param {number} [size] The size of the page to be returned
         * @param {Array<string>} [sort] Sorting criteria in the format: property(,asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getHttpLogs: async (fromDate: string, method?: string, userName?: string, status?: number, userAgentContains?: string, requestedUrlContains?: string, page?: number, size?: number, sort?: Array<string>, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'fromDate' is not null or undefined
            if (fromDate === null || fromDate === undefined) {
                throw new RequiredError('fromDate','Required parameter fromDate was null or undefined when calling getHttpLogs.');
            }
            const localVarPath = `/v2/logs`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, 'https://example.com');
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (fromDate !== undefined) {
                localVarQueryParameter['fromDate'] = fromDate;
            }

            if (method !== undefined) {
                localVarQueryParameter['method'] = method;
            }

            if (userName !== undefined) {
                localVarQueryParameter['userName'] = userName;
            }

            if (status !== undefined) {
                localVarQueryParameter['status'] = status;
            }

            if (userAgentContains !== undefined) {
                localVarQueryParameter['userAgentContains'] = userAgentContains;
            }

            if (requestedUrlContains !== undefined) {
                localVarQueryParameter['requestedUrlContains'] = requestedUrlContains;
            }

            if (page !== undefined) {
                localVarQueryParameter['page'] = page;
            }

            if (size !== undefined) {
                localVarQueryParameter['size'] = size;
            }

            if (sort) {
                localVarQueryParameter['sort'] = sort;
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
    }
};

/**
 * HttpLogsControllerApi - functional programming interface
 * @export
 */
export const HttpLogsControllerApiFp = function(configuration?: Configuration) {
    return {
        /**
         * Must have DASHBOARD_ADMIN privilege to access. This detailed info includes the request/response bodies (if present)
         * @summary Retrieves the full record of a particular request
         * @param {string} id 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getHttpLogDetails(id: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<HttpLogEntryDetailsDto>> {
            const localVarAxiosArgs = await HttpLogsControllerApiAxiosParamCreator(configuration).getHttpLogDetails(id, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: (configuration?.basePath || basePath) + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * Must have DASHBOARD_ADMIN privilege to access.  Date time given is in the format \'yyyy-MM-ddTHH:mm:ss\' and should be in UTC time. This date time parameter is required.  This is also a pageable interface (using page and size query params).
         * @summary Retrieves a subset of the server http trace logs from a specified date
         * @param {string} fromDate The date/time from which to query from - format yyyy-MM-dd\&#39;T\&#39;HH:mm:ss - in UTC
         * @param {string} [method] HTTP method to filter on, e.g. GET, POST, etc
         * @param {string} [userName] Username to filter on
         * @param {number} [status] HTTP response status to sort on
         * @param {string} [userAgentContains] Filter by user agent containing given string
         * @param {string} [requestedUrlContains] Filter by requested url containing given string
         * @param {number} [page] Zero-based page index (0..N)
         * @param {number} [size] The size of the page to be returned
         * @param {Array<string>} [sort] Sorting criteria in the format: property(,asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getHttpLogs(fromDate: string, method?: string, userName?: string, status?: number, userAgentContains?: string, requestedUrlContains?: string, page?: number, size?: number, sort?: Array<string>, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<HttpLogDtoPaginationResponseWrapper>> {
            const localVarAxiosArgs = await HttpLogsControllerApiAxiosParamCreator(configuration).getHttpLogs(fromDate, method, userName, status, userAgentContains, requestedUrlContains, page, size, sort, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: (configuration?.basePath || basePath) + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
    }
};

/**
 * HttpLogsControllerApi - factory interface
 * @export
 */
export const HttpLogsControllerApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    return {
        /**
         * Must have DASHBOARD_ADMIN privilege to access. This detailed info includes the request/response bodies (if present)
         * @summary Retrieves the full record of a particular request
         * @param {string} id 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getHttpLogDetails(id: string, options?: any): AxiosPromise<HttpLogEntryDetailsDto> {
            return HttpLogsControllerApiFp(configuration).getHttpLogDetails(id, options).then((request) => request(axios, basePath));
        },
        /**
         * Must have DASHBOARD_ADMIN privilege to access.  Date time given is in the format \'yyyy-MM-ddTHH:mm:ss\' and should be in UTC time. This date time parameter is required.  This is also a pageable interface (using page and size query params).
         * @summary Retrieves a subset of the server http trace logs from a specified date
         * @param {string} fromDate The date/time from which to query from - format yyyy-MM-dd\&#39;T\&#39;HH:mm:ss - in UTC
         * @param {string} [method] HTTP method to filter on, e.g. GET, POST, etc
         * @param {string} [userName] Username to filter on
         * @param {number} [status] HTTP response status to sort on
         * @param {string} [userAgentContains] Filter by user agent containing given string
         * @param {string} [requestedUrlContains] Filter by requested url containing given string
         * @param {number} [page] Zero-based page index (0..N)
         * @param {number} [size] The size of the page to be returned
         * @param {Array<string>} [sort] Sorting criteria in the format: property(,asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getHttpLogs(fromDate: string, method?: string, userName?: string, status?: number, userAgentContains?: string, requestedUrlContains?: string, page?: number, size?: number, sort?: Array<string>, options?: any): AxiosPromise<HttpLogDtoPaginationResponseWrapper> {
            return HttpLogsControllerApiFp(configuration).getHttpLogs(fromDate, method, userName, status, userAgentContains, requestedUrlContains, page, size, sort, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * HttpLogsControllerApi - interface
 * @export
 * @interface HttpLogsControllerApi
 */
export interface HttpLogsControllerApiInterface {
    /**
     * Must have DASHBOARD_ADMIN privilege to access. This detailed info includes the request/response bodies (if present)
     * @summary Retrieves the full record of a particular request
     * @param {string} id 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof HttpLogsControllerApiInterface
     */
    getHttpLogDetails(id: string, options?: any): AxiosPromise<HttpLogEntryDetailsDto>;

    /**
     * Must have DASHBOARD_ADMIN privilege to access.  Date time given is in the format \'yyyy-MM-ddTHH:mm:ss\' and should be in UTC time. This date time parameter is required.  This is also a pageable interface (using page and size query params).
     * @summary Retrieves a subset of the server http trace logs from a specified date
     * @param {string} fromDate The date/time from which to query from - format yyyy-MM-dd\&#39;T\&#39;HH:mm:ss - in UTC
     * @param {string} [method] HTTP method to filter on, e.g. GET, POST, etc
     * @param {string} [userName] Username to filter on
     * @param {number} [status] HTTP response status to sort on
     * @param {string} [userAgentContains] Filter by user agent containing given string
     * @param {string} [requestedUrlContains] Filter by requested url containing given string
     * @param {number} [page] Zero-based page index (0..N)
     * @param {number} [size] The size of the page to be returned
     * @param {Array<string>} [sort] Sorting criteria in the format: property(,asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof HttpLogsControllerApiInterface
     */
    getHttpLogs(fromDate: string, method?: string, userName?: string, status?: number, userAgentContains?: string, requestedUrlContains?: string, page?: number, size?: number, sort?: Array<string>, options?: any): AxiosPromise<HttpLogDtoPaginationResponseWrapper>;

}

/**
 * HttpLogsControllerApi - object-oriented interface
 * @export
 * @class HttpLogsControllerApi
 * @extends {BaseAPI}
 */
export class HttpLogsControllerApi extends BaseAPI implements HttpLogsControllerApiInterface {
    /**
     * Must have DASHBOARD_ADMIN privilege to access. This detailed info includes the request/response bodies (if present)
     * @summary Retrieves the full record of a particular request
     * @param {string} id 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof HttpLogsControllerApi
     */
    public getHttpLogDetails(id: string, options?: any) {
        return HttpLogsControllerApiFp(this.configuration).getHttpLogDetails(id, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Must have DASHBOARD_ADMIN privilege to access.  Date time given is in the format \'yyyy-MM-ddTHH:mm:ss\' and should be in UTC time. This date time parameter is required.  This is also a pageable interface (using page and size query params).
     * @summary Retrieves a subset of the server http trace logs from a specified date
     * @param {string} fromDate The date/time from which to query from - format yyyy-MM-dd\&#39;T\&#39;HH:mm:ss - in UTC
     * @param {string} [method] HTTP method to filter on, e.g. GET, POST, etc
     * @param {string} [userName] Username to filter on
     * @param {number} [status] HTTP response status to sort on
     * @param {string} [userAgentContains] Filter by user agent containing given string
     * @param {string} [requestedUrlContains] Filter by requested url containing given string
     * @param {number} [page] Zero-based page index (0..N)
     * @param {number} [size] The size of the page to be returned
     * @param {Array<string>} [sort] Sorting criteria in the format: property(,asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof HttpLogsControllerApi
     */
    public getHttpLogs(fromDate: string, method?: string, userName?: string, status?: number, userAgentContains?: string, requestedUrlContains?: string, page?: number, size?: number, sort?: Array<string>, options?: any) {
        return HttpLogsControllerApiFp(this.configuration).getHttpLogs(fromDate, method, userName, status, userAgentContains, requestedUrlContains, page, size, sort, options).then((request) => request(this.axios, this.basePath));
    }
}
