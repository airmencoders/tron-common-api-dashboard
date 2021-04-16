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
import { AppClientCountMetricDto } from '../models';
// @ts-ignore
import { AppSourceCountMetricDto } from '../models';
// @ts-ignore
import { AppSourceMetricDto } from '../models';
// @ts-ignore
import { EndpointCountMetricDto } from '../models';
// @ts-ignore
import { EndpointMetricDto } from '../models';
/**
 * MetricsControllerApi - axios parameter creator
 * @export
 */
export const MetricsControllerApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Retrieves all stored metric values for given app source
         * @summary Retrieves all stored metrics values for given app source
         * @param {string} id App Source Id to search with
         * @param {string} startDate Earliest date to include
         * @param {string} endDate Latest date to include
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAllMetricsForAppSource: async (id: string, startDate: string, endDate: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            if (id === null || id === undefined) {
                throw new RequiredError('id','Required parameter id was null or undefined when calling getAllMetricsForAppSource.');
            }
            // verify required parameter 'startDate' is not null or undefined
            if (startDate === null || startDate === undefined) {
                throw new RequiredError('startDate','Required parameter startDate was null or undefined when calling getAllMetricsForAppSource.');
            }
            // verify required parameter 'endDate' is not null or undefined
            if (endDate === null || endDate === undefined) {
                throw new RequiredError('endDate','Required parameter endDate was null or undefined when calling getAllMetricsForAppSource.');
            }
            const localVarPath = `/v1/metrics/appsource/{id}`
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

            if (startDate !== undefined) {
                localVarQueryParameter['startDate'] = (startDate as any instanceof Date) ?
                    (startDate as any).toISOString() :
                    startDate;
            }

            if (endDate !== undefined) {
                localVarQueryParameter['endDate'] = (endDate as any instanceof Date) ?
                    (endDate as any).toISOString() :
                    endDate;
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
         * Retrieves all stored metric values for given endpoint
         * @summary Retrieves all stored metrics values for given endpoint
         * @param {string} id Endpoint Id to search with
         * @param {string} startDate Earliest date to include
         * @param {string} endDate Latest date to include
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAllMetricsForEndpoint: async (id: string, startDate: string, endDate: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            if (id === null || id === undefined) {
                throw new RequiredError('id','Required parameter id was null or undefined when calling getAllMetricsForEndpoint.');
            }
            // verify required parameter 'startDate' is not null or undefined
            if (startDate === null || startDate === undefined) {
                throw new RequiredError('startDate','Required parameter startDate was null or undefined when calling getAllMetricsForEndpoint.');
            }
            // verify required parameter 'endDate' is not null or undefined
            if (endDate === null || endDate === undefined) {
                throw new RequiredError('endDate','Required parameter endDate was null or undefined when calling getAllMetricsForEndpoint.');
            }
            const localVarPath = `/v1/metrics/endpoint/{id}`
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

            if (startDate !== undefined) {
                localVarQueryParameter['startDate'] = (startDate as any instanceof Date) ?
                    (startDate as any).toISOString() :
                    startDate;
            }

            if (endDate !== undefined) {
                localVarQueryParameter['endDate'] = (endDate as any instanceof Date) ?
                    (endDate as any).toISOString() :
                    endDate;
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
         * Retrieves sum of stored metric values for given app client name on given app source for each endpoint
         * @summary Retrieves sum of stored metric values for given app client name on given app source
         * @param {string} id App Source Id to search with
         * @param {string} name App Client Name to search with
         * @param {string} startDate Earliest date to include
         * @param {string} endDate Latest date to include
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getCountOfMetricsForAppClient: async (id: string, name: string, startDate: string, endDate: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            if (id === null || id === undefined) {
                throw new RequiredError('id','Required parameter id was null or undefined when calling getCountOfMetricsForAppClient.');
            }
            // verify required parameter 'name' is not null or undefined
            if (name === null || name === undefined) {
                throw new RequiredError('name','Required parameter name was null or undefined when calling getCountOfMetricsForAppClient.');
            }
            // verify required parameter 'startDate' is not null or undefined
            if (startDate === null || startDate === undefined) {
                throw new RequiredError('startDate','Required parameter startDate was null or undefined when calling getCountOfMetricsForAppClient.');
            }
            // verify required parameter 'endDate' is not null or undefined
            if (endDate === null || endDate === undefined) {
                throw new RequiredError('endDate','Required parameter endDate was null or undefined when calling getCountOfMetricsForAppClient.');
            }
            const localVarPath = `/v1/metrics/count/{id}/appclient`
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

            if (name !== undefined) {
                localVarQueryParameter['name'] = name;
            }

            if (startDate !== undefined) {
                localVarQueryParameter['startDate'] = (startDate as any instanceof Date) ?
                    (startDate as any).toISOString() :
                    startDate;
            }

            if (endDate !== undefined) {
                localVarQueryParameter['endDate'] = (endDate as any instanceof Date) ?
                    (endDate as any).toISOString() :
                    endDate;
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
         * Retrieves sum of stored metric values for given app source for each endppoint and for each app client
         * @summary Retrieves sum of stored metric values for given app source
         * @param {string} id App Source Id to search with
         * @param {string} startDate Earliest date to include
         * @param {string} endDate Latest date to include
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getCountOfMetricsForAppSource: async (id: string, startDate: string, endDate: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            if (id === null || id === undefined) {
                throw new RequiredError('id','Required parameter id was null or undefined when calling getCountOfMetricsForAppSource.');
            }
            // verify required parameter 'startDate' is not null or undefined
            if (startDate === null || startDate === undefined) {
                throw new RequiredError('startDate','Required parameter startDate was null or undefined when calling getCountOfMetricsForAppSource.');
            }
            // verify required parameter 'endDate' is not null or undefined
            if (endDate === null || endDate === undefined) {
                throw new RequiredError('endDate','Required parameter endDate was null or undefined when calling getCountOfMetricsForAppSource.');
            }
            const localVarPath = `/v1/metrics/count/{id}`
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

            if (startDate !== undefined) {
                localVarQueryParameter['startDate'] = (startDate as any instanceof Date) ?
                    (startDate as any).toISOString() :
                    startDate;
            }

            if (endDate !== undefined) {
                localVarQueryParameter['endDate'] = (endDate as any instanceof Date) ?
                    (endDate as any).toISOString() :
                    endDate;
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
         * Retrieves sum of stored metric values for given endpoint path on given app source for each app client
         * @summary Retrieves sum of stored metric values for given endpoint path on given app source
         * @param {string} id App Source Id to search with
         * @param {string} path Endpoint Path to search with
         * @param {string} startDate Earliest date to include
         * @param {string} endDate Latest date to include
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getCountOfMetricsForEndpoint: async (id: string, path: string, startDate: string, endDate: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            if (id === null || id === undefined) {
                throw new RequiredError('id','Required parameter id was null or undefined when calling getCountOfMetricsForEndpoint.');
            }
            // verify required parameter 'path' is not null or undefined
            if (path === null || path === undefined) {
                throw new RequiredError('path','Required parameter path was null or undefined when calling getCountOfMetricsForEndpoint.');
            }
            // verify required parameter 'startDate' is not null or undefined
            if (startDate === null || startDate === undefined) {
                throw new RequiredError('startDate','Required parameter startDate was null or undefined when calling getCountOfMetricsForEndpoint.');
            }
            // verify required parameter 'endDate' is not null or undefined
            if (endDate === null || endDate === undefined) {
                throw new RequiredError('endDate','Required parameter endDate was null or undefined when calling getCountOfMetricsForEndpoint.');
            }
            const localVarPath = `/v1/metrics/count/{id}/endpoint`
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

            if (startDate !== undefined) {
                localVarQueryParameter['startDate'] = (startDate as any instanceof Date) ?
                    (startDate as any).toISOString() :
                    startDate;
            }

            if (endDate !== undefined) {
                localVarQueryParameter['endDate'] = (endDate as any instanceof Date) ?
                    (endDate as any).toISOString() :
                    endDate;
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
 * MetricsControllerApi - functional programming interface
 * @export
 */
export const MetricsControllerApiFp = function(configuration?: Configuration) {
    return {
        /**
         * Retrieves all stored metric values for given app source
         * @summary Retrieves all stored metrics values for given app source
         * @param {string} id App Source Id to search with
         * @param {string} startDate Earliest date to include
         * @param {string} endDate Latest date to include
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getAllMetricsForAppSource(id: string, startDate: string, endDate: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<AppSourceMetricDto>> {
            const localVarAxiosArgs = await MetricsControllerApiAxiosParamCreator(configuration).getAllMetricsForAppSource(id, startDate, endDate, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: (configuration?.basePath || basePath) + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * Retrieves all stored metric values for given endpoint
         * @summary Retrieves all stored metrics values for given endpoint
         * @param {string} id Endpoint Id to search with
         * @param {string} startDate Earliest date to include
         * @param {string} endDate Latest date to include
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getAllMetricsForEndpoint(id: string, startDate: string, endDate: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<EndpointMetricDto>> {
            const localVarAxiosArgs = await MetricsControllerApiAxiosParamCreator(configuration).getAllMetricsForEndpoint(id, startDate, endDate, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: (configuration?.basePath || basePath) + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * Retrieves sum of stored metric values for given app client name on given app source for each endpoint
         * @summary Retrieves sum of stored metric values for given app client name on given app source
         * @param {string} id App Source Id to search with
         * @param {string} name App Client Name to search with
         * @param {string} startDate Earliest date to include
         * @param {string} endDate Latest date to include
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getCountOfMetricsForAppClient(id: string, name: string, startDate: string, endDate: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<AppClientCountMetricDto>> {
            const localVarAxiosArgs = await MetricsControllerApiAxiosParamCreator(configuration).getCountOfMetricsForAppClient(id, name, startDate, endDate, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: (configuration?.basePath || basePath) + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * Retrieves sum of stored metric values for given app source for each endppoint and for each app client
         * @summary Retrieves sum of stored metric values for given app source
         * @param {string} id App Source Id to search with
         * @param {string} startDate Earliest date to include
         * @param {string} endDate Latest date to include
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getCountOfMetricsForAppSource(id: string, startDate: string, endDate: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<AppSourceCountMetricDto>> {
            const localVarAxiosArgs = await MetricsControllerApiAxiosParamCreator(configuration).getCountOfMetricsForAppSource(id, startDate, endDate, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: (configuration?.basePath || basePath) + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * Retrieves sum of stored metric values for given endpoint path on given app source for each app client
         * @summary Retrieves sum of stored metric values for given endpoint path on given app source
         * @param {string} id App Source Id to search with
         * @param {string} path Endpoint Path to search with
         * @param {string} startDate Earliest date to include
         * @param {string} endDate Latest date to include
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getCountOfMetricsForEndpoint(id: string, path: string, startDate: string, endDate: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<EndpointCountMetricDto>> {
            const localVarAxiosArgs = await MetricsControllerApiAxiosParamCreator(configuration).getCountOfMetricsForEndpoint(id, path, startDate, endDate, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: (configuration?.basePath || basePath) + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
    }
};

/**
 * MetricsControllerApi - factory interface
 * @export
 */
export const MetricsControllerApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    return {
        /**
         * Retrieves all stored metric values for given app source
         * @summary Retrieves all stored metrics values for given app source
         * @param {string} id App Source Id to search with
         * @param {string} startDate Earliest date to include
         * @param {string} endDate Latest date to include
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAllMetricsForAppSource(id: string, startDate: string, endDate: string, options?: any): AxiosPromise<AppSourceMetricDto> {
            return MetricsControllerApiFp(configuration).getAllMetricsForAppSource(id, startDate, endDate, options).then((request) => request(axios, basePath));
        },
        /**
         * Retrieves all stored metric values for given endpoint
         * @summary Retrieves all stored metrics values for given endpoint
         * @param {string} id Endpoint Id to search with
         * @param {string} startDate Earliest date to include
         * @param {string} endDate Latest date to include
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAllMetricsForEndpoint(id: string, startDate: string, endDate: string, options?: any): AxiosPromise<EndpointMetricDto> {
            return MetricsControllerApiFp(configuration).getAllMetricsForEndpoint(id, startDate, endDate, options).then((request) => request(axios, basePath));
        },
        /**
         * Retrieves sum of stored metric values for given app client name on given app source for each endpoint
         * @summary Retrieves sum of stored metric values for given app client name on given app source
         * @param {string} id App Source Id to search with
         * @param {string} name App Client Name to search with
         * @param {string} startDate Earliest date to include
         * @param {string} endDate Latest date to include
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getCountOfMetricsForAppClient(id: string, name: string, startDate: string, endDate: string, options?: any): AxiosPromise<AppClientCountMetricDto> {
            return MetricsControllerApiFp(configuration).getCountOfMetricsForAppClient(id, name, startDate, endDate, options).then((request) => request(axios, basePath));
        },
        /**
         * Retrieves sum of stored metric values for given app source for each endppoint and for each app client
         * @summary Retrieves sum of stored metric values for given app source
         * @param {string} id App Source Id to search with
         * @param {string} startDate Earliest date to include
         * @param {string} endDate Latest date to include
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getCountOfMetricsForAppSource(id: string, startDate: string, endDate: string, options?: any): AxiosPromise<AppSourceCountMetricDto> {
            return MetricsControllerApiFp(configuration).getCountOfMetricsForAppSource(id, startDate, endDate, options).then((request) => request(axios, basePath));
        },
        /**
         * Retrieves sum of stored metric values for given endpoint path on given app source for each app client
         * @summary Retrieves sum of stored metric values for given endpoint path on given app source
         * @param {string} id App Source Id to search with
         * @param {string} path Endpoint Path to search with
         * @param {string} startDate Earliest date to include
         * @param {string} endDate Latest date to include
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getCountOfMetricsForEndpoint(id: string, path: string, startDate: string, endDate: string, options?: any): AxiosPromise<EndpointCountMetricDto> {
            return MetricsControllerApiFp(configuration).getCountOfMetricsForEndpoint(id, path, startDate, endDate, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * MetricsControllerApi - interface
 * @export
 * @interface MetricsControllerApi
 */
export interface MetricsControllerApiInterface {
    /**
     * Retrieves all stored metric values for given app source
     * @summary Retrieves all stored metrics values for given app source
     * @param {string} id App Source Id to search with
     * @param {string} startDate Earliest date to include
     * @param {string} endDate Latest date to include
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof MetricsControllerApiInterface
     */
    getAllMetricsForAppSource(id: string, startDate: string, endDate: string, options?: any): AxiosPromise<AppSourceMetricDto>;

    /**
     * Retrieves all stored metric values for given endpoint
     * @summary Retrieves all stored metrics values for given endpoint
     * @param {string} id Endpoint Id to search with
     * @param {string} startDate Earliest date to include
     * @param {string} endDate Latest date to include
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof MetricsControllerApiInterface
     */
    getAllMetricsForEndpoint(id: string, startDate: string, endDate: string, options?: any): AxiosPromise<EndpointMetricDto>;

    /**
     * Retrieves sum of stored metric values for given app client name on given app source for each endpoint
     * @summary Retrieves sum of stored metric values for given app client name on given app source
     * @param {string} id App Source Id to search with
     * @param {string} name App Client Name to search with
     * @param {string} startDate Earliest date to include
     * @param {string} endDate Latest date to include
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof MetricsControllerApiInterface
     */
    getCountOfMetricsForAppClient(id: string, name: string, startDate: string, endDate: string, options?: any): AxiosPromise<AppClientCountMetricDto>;

    /**
     * Retrieves sum of stored metric values for given app source for each endppoint and for each app client
     * @summary Retrieves sum of stored metric values for given app source
     * @param {string} id App Source Id to search with
     * @param {string} startDate Earliest date to include
     * @param {string} endDate Latest date to include
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof MetricsControllerApiInterface
     */
    getCountOfMetricsForAppSource(id: string, startDate: string, endDate: string, options?: any): AxiosPromise<AppSourceCountMetricDto>;

    /**
     * Retrieves sum of stored metric values for given endpoint path on given app source for each app client
     * @summary Retrieves sum of stored metric values for given endpoint path on given app source
     * @param {string} id App Source Id to search with
     * @param {string} path Endpoint Path to search with
     * @param {string} startDate Earliest date to include
     * @param {string} endDate Latest date to include
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof MetricsControllerApiInterface
     */
    getCountOfMetricsForEndpoint(id: string, path: string, startDate: string, endDate: string, options?: any): AxiosPromise<EndpointCountMetricDto>;

}

/**
 * MetricsControllerApi - object-oriented interface
 * @export
 * @class MetricsControllerApi
 * @extends {BaseAPI}
 */
export class MetricsControllerApi extends BaseAPI implements MetricsControllerApiInterface {
    /**
     * Retrieves all stored metric values for given app source
     * @summary Retrieves all stored metrics values for given app source
     * @param {string} id App Source Id to search with
     * @param {string} startDate Earliest date to include
     * @param {string} endDate Latest date to include
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof MetricsControllerApi
     */
    public getAllMetricsForAppSource(id: string, startDate: string, endDate: string, options?: any) {
        return MetricsControllerApiFp(this.configuration).getAllMetricsForAppSource(id, startDate, endDate, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Retrieves all stored metric values for given endpoint
     * @summary Retrieves all stored metrics values for given endpoint
     * @param {string} id Endpoint Id to search with
     * @param {string} startDate Earliest date to include
     * @param {string} endDate Latest date to include
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof MetricsControllerApi
     */
    public getAllMetricsForEndpoint(id: string, startDate: string, endDate: string, options?: any) {
        return MetricsControllerApiFp(this.configuration).getAllMetricsForEndpoint(id, startDate, endDate, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Retrieves sum of stored metric values for given app client name on given app source for each endpoint
     * @summary Retrieves sum of stored metric values for given app client name on given app source
     * @param {string} id App Source Id to search with
     * @param {string} name App Client Name to search with
     * @param {string} startDate Earliest date to include
     * @param {string} endDate Latest date to include
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof MetricsControllerApi
     */
    public getCountOfMetricsForAppClient(id: string, name: string, startDate: string, endDate: string, options?: any) {
        return MetricsControllerApiFp(this.configuration).getCountOfMetricsForAppClient(id, name, startDate, endDate, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Retrieves sum of stored metric values for given app source for each endppoint and for each app client
     * @summary Retrieves sum of stored metric values for given app source
     * @param {string} id App Source Id to search with
     * @param {string} startDate Earliest date to include
     * @param {string} endDate Latest date to include
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof MetricsControllerApi
     */
    public getCountOfMetricsForAppSource(id: string, startDate: string, endDate: string, options?: any) {
        return MetricsControllerApiFp(this.configuration).getCountOfMetricsForAppSource(id, startDate, endDate, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Retrieves sum of stored metric values for given endpoint path on given app source for each app client
     * @summary Retrieves sum of stored metric values for given endpoint path on given app source
     * @param {string} id App Source Id to search with
     * @param {string} path Endpoint Path to search with
     * @param {string} startDate Earliest date to include
     * @param {string} endDate Latest date to include
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof MetricsControllerApi
     */
    public getCountOfMetricsForEndpoint(id: string, path: string, startDate: string, endDate: string, options?: any) {
        return MetricsControllerApiFp(this.configuration).getCountOfMetricsForEndpoint(id, path, startDate, endDate, options).then((request) => request(this.axios, this.basePath));
    }
}
