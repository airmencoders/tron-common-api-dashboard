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
import { AppSourceDetailsDto } from '../models';
// @ts-ignore
import { AppSourceDto } from '../models';
// @ts-ignore
import { ExceptionResponse } from '../models';
/**
 * AppSourceControllerApi - axios parameter creator
 * @export
 */
export const AppSourceControllerApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @summary Creates an App Source including App Client permissions.
         * @param {AppSourceDetailsDto} appSourceDetailsDto 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createAppSource: async (appSourceDetailsDto: AppSourceDetailsDto, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'appSourceDetailsDto' is not null or undefined
            if (appSourceDetailsDto === null || appSourceDetailsDto === undefined) {
                throw new RequiredError('appSourceDetailsDto','Required parameter appSourceDetailsDto was null or undefined when calling createAppSource.');
            }
            const localVarPath = `/v1/app-source`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, 'https://example.com');
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

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
            const nonString = typeof appSourceDetailsDto !== 'string';
            const needsSerialization = nonString && configuration && configuration.isJsonMime
                ? configuration.isJsonMime(localVarRequestOptions.headers['Content-Type'])
                : nonString;
            localVarRequestOptions.data =  needsSerialization
                ? JSON.stringify(appSourceDetailsDto !== undefined ? appSourceDetailsDto : {})
                : (appSourceDetailsDto || "");

            return {
                url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
                options: localVarRequestOptions,
            };
        },
        /**
         * Requester has to have DASHBOARD_ADMIN rights
         * @summary Deletes the App Source
         * @param {string} id App Source UUID
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteAppSource: async (id: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            if (id === null || id === undefined) {
                throw new RequiredError('id','Required parameter id was null or undefined when calling deleteAppSource.');
            }
            const localVarPath = `/v1/app-source/{id}`
                .replace(`{${"id"}}`, encodeURIComponent(String(id)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, 'https://example.com');
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'DELETE', ...baseOptions, ...options};
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
         * 
         * @summary Returns the details for an App Source
         * @param {string} id App Source UUID
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAppSourceDetails: async (id: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            if (id === null || id === undefined) {
                throw new RequiredError('id','Required parameter id was null or undefined when calling getAppSourceDetails.');
            }
            const localVarPath = `/v1/app-source/{id}`
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
         * 
         * @summary Gets all App Sources.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAppSources: async (options: any = {}): Promise<RequestArgs> => {
            const localVarPath = `/v1/app-source`;
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
         * 
         * @summary Updates the details for an App Source
         * @param {string} id App Source id to update
         * @param {AppSourceDetailsDto} appSourceDetailsDto 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        updateAppSourceDetails: async (id: string, appSourceDetailsDto: AppSourceDetailsDto, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            if (id === null || id === undefined) {
                throw new RequiredError('id','Required parameter id was null or undefined when calling updateAppSourceDetails.');
            }
            // verify required parameter 'appSourceDetailsDto' is not null or undefined
            if (appSourceDetailsDto === null || appSourceDetailsDto === undefined) {
                throw new RequiredError('appSourceDetailsDto','Required parameter appSourceDetailsDto was null or undefined when calling updateAppSourceDetails.');
            }
            const localVarPath = `/v1/app-source/{id}`
                .replace(`{${"id"}}`, encodeURIComponent(String(id)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, 'https://example.com');
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'PUT', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

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
            const nonString = typeof appSourceDetailsDto !== 'string';
            const needsSerialization = nonString && configuration && configuration.isJsonMime
                ? configuration.isJsonMime(localVarRequestOptions.headers['Content-Type'])
                : nonString;
            localVarRequestOptions.data =  needsSerialization
                ? JSON.stringify(appSourceDetailsDto !== undefined ? appSourceDetailsDto : {})
                : (appSourceDetailsDto || "");

            return {
                url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * AppSourceControllerApi - functional programming interface
 * @export
 */
export const AppSourceControllerApiFp = function(configuration?: Configuration) {
    return {
        /**
         * 
         * @summary Creates an App Source including App Client permissions.
         * @param {AppSourceDetailsDto} appSourceDetailsDto 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createAppSource(appSourceDetailsDto: AppSourceDetailsDto, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<AppSourceDetailsDto>> {
            const localVarAxiosArgs = await AppSourceControllerApiAxiosParamCreator(configuration).createAppSource(appSourceDetailsDto, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: (configuration?.basePath || basePath) + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * Requester has to have DASHBOARD_ADMIN rights
         * @summary Deletes the App Source
         * @param {string} id App Source UUID
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async deleteAppSource(id: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<AppSourceDetailsDto>> {
            const localVarAxiosArgs = await AppSourceControllerApiAxiosParamCreator(configuration).deleteAppSource(id, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: (configuration?.basePath || basePath) + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * 
         * @summary Returns the details for an App Source
         * @param {string} id App Source UUID
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getAppSourceDetails(id: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<AppSourceDetailsDto>> {
            const localVarAxiosArgs = await AppSourceControllerApiAxiosParamCreator(configuration).getAppSourceDetails(id, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: (configuration?.basePath || basePath) + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * 
         * @summary Gets all App Sources.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getAppSources(options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Array<AppSourceDto>>> {
            const localVarAxiosArgs = await AppSourceControllerApiAxiosParamCreator(configuration).getAppSources(options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: (configuration?.basePath || basePath) + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * 
         * @summary Updates the details for an App Source
         * @param {string} id App Source id to update
         * @param {AppSourceDetailsDto} appSourceDetailsDto 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async updateAppSourceDetails(id: string, appSourceDetailsDto: AppSourceDetailsDto, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<AppSourceDetailsDto>> {
            const localVarAxiosArgs = await AppSourceControllerApiAxiosParamCreator(configuration).updateAppSourceDetails(id, appSourceDetailsDto, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: (configuration?.basePath || basePath) + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
    }
};

/**
 * AppSourceControllerApi - factory interface
 * @export
 */
export const AppSourceControllerApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    return {
        /**
         * 
         * @summary Creates an App Source including App Client permissions.
         * @param {AppSourceDetailsDto} appSourceDetailsDto 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createAppSource(appSourceDetailsDto: AppSourceDetailsDto, options?: any): AxiosPromise<AppSourceDetailsDto> {
            return AppSourceControllerApiFp(configuration).createAppSource(appSourceDetailsDto, options).then((request) => request(axios, basePath));
        },
        /**
         * Requester has to have DASHBOARD_ADMIN rights
         * @summary Deletes the App Source
         * @param {string} id App Source UUID
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteAppSource(id: string, options?: any): AxiosPromise<AppSourceDetailsDto> {
            return AppSourceControllerApiFp(configuration).deleteAppSource(id, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Returns the details for an App Source
         * @param {string} id App Source UUID
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAppSourceDetails(id: string, options?: any): AxiosPromise<AppSourceDetailsDto> {
            return AppSourceControllerApiFp(configuration).getAppSourceDetails(id, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Gets all App Sources.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAppSources(options?: any): AxiosPromise<Array<AppSourceDto>> {
            return AppSourceControllerApiFp(configuration).getAppSources(options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Updates the details for an App Source
         * @param {string} id App Source id to update
         * @param {AppSourceDetailsDto} appSourceDetailsDto 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        updateAppSourceDetails(id: string, appSourceDetailsDto: AppSourceDetailsDto, options?: any): AxiosPromise<AppSourceDetailsDto> {
            return AppSourceControllerApiFp(configuration).updateAppSourceDetails(id, appSourceDetailsDto, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * AppSourceControllerApi - interface
 * @export
 * @interface AppSourceControllerApi
 */
export interface AppSourceControllerApiInterface {
    /**
     * 
     * @summary Creates an App Source including App Client permissions.
     * @param {AppSourceDetailsDto} appSourceDetailsDto 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AppSourceControllerApiInterface
     */
    createAppSource(appSourceDetailsDto: AppSourceDetailsDto, options?: any): AxiosPromise<AppSourceDetailsDto>;

    /**
     * Requester has to have DASHBOARD_ADMIN rights
     * @summary Deletes the App Source
     * @param {string} id App Source UUID
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AppSourceControllerApiInterface
     */
    deleteAppSource(id: string, options?: any): AxiosPromise<AppSourceDetailsDto>;

    /**
     * 
     * @summary Returns the details for an App Source
     * @param {string} id App Source UUID
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AppSourceControllerApiInterface
     */
    getAppSourceDetails(id: string, options?: any): AxiosPromise<AppSourceDetailsDto>;

    /**
     * 
     * @summary Gets all App Sources.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AppSourceControllerApiInterface
     */
    getAppSources(options?: any): AxiosPromise<Array<AppSourceDto>>;

    /**
     * 
     * @summary Updates the details for an App Source
     * @param {string} id App Source id to update
     * @param {AppSourceDetailsDto} appSourceDetailsDto 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AppSourceControllerApiInterface
     */
    updateAppSourceDetails(id: string, appSourceDetailsDto: AppSourceDetailsDto, options?: any): AxiosPromise<AppSourceDetailsDto>;

}

/**
 * AppSourceControllerApi - object-oriented interface
 * @export
 * @class AppSourceControllerApi
 * @extends {BaseAPI}
 */
export class AppSourceControllerApi extends BaseAPI implements AppSourceControllerApiInterface {
    /**
     * 
     * @summary Creates an App Source including App Client permissions.
     * @param {AppSourceDetailsDto} appSourceDetailsDto 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AppSourceControllerApi
     */
    public createAppSource(appSourceDetailsDto: AppSourceDetailsDto, options?: any) {
        return AppSourceControllerApiFp(this.configuration).createAppSource(appSourceDetailsDto, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Requester has to have DASHBOARD_ADMIN rights
     * @summary Deletes the App Source
     * @param {string} id App Source UUID
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AppSourceControllerApi
     */
    public deleteAppSource(id: string, options?: any) {
        return AppSourceControllerApiFp(this.configuration).deleteAppSource(id, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Returns the details for an App Source
     * @param {string} id App Source UUID
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AppSourceControllerApi
     */
    public getAppSourceDetails(id: string, options?: any) {
        return AppSourceControllerApiFp(this.configuration).getAppSourceDetails(id, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Gets all App Sources.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AppSourceControllerApi
     */
    public getAppSources(options?: any) {
        return AppSourceControllerApiFp(this.configuration).getAppSources(options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Updates the details for an App Source
     * @param {string} id App Source id to update
     * @param {AppSourceDetailsDto} appSourceDetailsDto 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AppSourceControllerApi
     */
    public updateAppSourceDetails(id: string, appSourceDetailsDto: AppSourceDetailsDto, options?: any) {
        return AppSourceControllerApiFp(this.configuration).updateAppSourceDetails(id, appSourceDetailsDto, options).then((request) => request(this.axios, this.basePath));
    }
}
