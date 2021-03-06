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
import { AppClientUserDetailsDto } from '../models';
// @ts-ignore
import { AppClientUserDto } from '../models';
// @ts-ignore
import { AppClientUserDtoResponseWrapped } from '../models';
// @ts-ignore
import { ExceptionResponse } from '../models';
// @ts-ignore
import { PrivilegeDtoResponseWrapper } from '../models';
/**
 * AppClientControllerApi - axios parameter creator
 * @export
 */
export const AppClientControllerApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Adds a App Client User. Requires DASHBOARD_ADMIN access.
         * @summary Adds an App Client
         * @param {AppClientUserDto} appClientUserDto 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createAppClientUser: async (appClientUserDto: AppClientUserDto, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'appClientUserDto' is not null or undefined
            if (appClientUserDto === null || appClientUserDto === undefined) {
                throw new RequiredError('appClientUserDto','Required parameter appClientUserDto was null or undefined when calling createAppClientUser.');
            }
            const localVarPath = `/v2/app-client`;
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
            const nonString = typeof appClientUserDto !== 'string';
            const needsSerialization = nonString && configuration && configuration.isJsonMime
                ? configuration.isJsonMime(localVarRequestOptions.headers['Content-Type'])
                : nonString;
            localVarRequestOptions.data =  needsSerialization
                ? JSON.stringify(appClientUserDto !== undefined ? appClientUserDto : {})
                : (appClientUserDto || "");

            return {
                url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
                options: localVarRequestOptions,
            };
        },
        /**
         * Deletes an existing App Client. Requires DASHBOARD_ADMIN access.
         * @summary Deletes an App Client
         * @param {string} id App Client ID to delete
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteAppClient: async (id: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            if (id === null || id === undefined) {
                throw new RequiredError('id','Required parameter id was null or undefined when calling deleteAppClient.');
            }
            const localVarPath = `/v2/app-client/{id}`
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
         * Get an App Client by its UUID. Requires DASHBOARD_ADMIN or be an App Client Developer of that UUID.
         * @summary Get an App Client\'s Information
         * @param {string} id 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAppClientRecord: async (id: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            if (id === null || id === undefined) {
                throw new RequiredError('id','Required parameter id was null or undefined when calling getAppClientRecord.');
            }
            const localVarPath = `/v2/app-client/{id}`
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
         * Retrieves application client user information.  Requires Dashboard Admin access or App Client Developer.
         * @summary Retrieves all application client user information
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAppClientUsersWrapped: async (options: any = {}): Promise<RequestArgs> => {
            const localVarPath = `/v2/app-client`;
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
         * Gets all the app client privileges so that privilege names can be mapped to their IDs. Must be a DASHBOARD_ADMIN or APP_CLIENT_DEVELOPER
         * @summary Gets all available privileges available for an app-client
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getClientTypePrivsWrapped: async (options: any = {}): Promise<RequestArgs> => {
            const localVarPath = `/v2/app-client/privs`;
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
         * Updates an existing Application Client. Requires DASHBOARD_ADMIN access to change any attribute,or be APP_CLIENT_DEVELOPER role for app client of given UUID to be able to manage change App Client Developers - any of fields changed as APP_CLIENT_DEVELOPER will not be changed.
         * @summary Updates an existing Application Client
         * @param {string} id App Client ID to update
         * @param {AppClientUserDto} appClientUserDto 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        updateAppClient: async (id: string, appClientUserDto: AppClientUserDto, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            if (id === null || id === undefined) {
                throw new RequiredError('id','Required parameter id was null or undefined when calling updateAppClient.');
            }
            // verify required parameter 'appClientUserDto' is not null or undefined
            if (appClientUserDto === null || appClientUserDto === undefined) {
                throw new RequiredError('appClientUserDto','Required parameter appClientUserDto was null or undefined when calling updateAppClient.');
            }
            const localVarPath = `/v2/app-client/{id}`
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
            const nonString = typeof appClientUserDto !== 'string';
            const needsSerialization = nonString && configuration && configuration.isJsonMime
                ? configuration.isJsonMime(localVarRequestOptions.headers['Content-Type'])
                : nonString;
            localVarRequestOptions.data =  needsSerialization
                ? JSON.stringify(appClientUserDto !== undefined ? appClientUserDto : {})
                : (appClientUserDto || "");

            return {
                url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * AppClientControllerApi - functional programming interface
 * @export
 */
export const AppClientControllerApiFp = function(configuration?: Configuration) {
    return {
        /**
         * Adds a App Client User. Requires DASHBOARD_ADMIN access.
         * @summary Adds an App Client
         * @param {AppClientUserDto} appClientUserDto 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createAppClientUser(appClientUserDto: AppClientUserDto, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<AppClientUserDto>> {
            const localVarAxiosArgs = await AppClientControllerApiAxiosParamCreator(configuration).createAppClientUser(appClientUserDto, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: (configuration?.basePath || basePath) + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * Deletes an existing App Client. Requires DASHBOARD_ADMIN access.
         * @summary Deletes an App Client
         * @param {string} id App Client ID to delete
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async deleteAppClient(id: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<AppClientUserDto>> {
            const localVarAxiosArgs = await AppClientControllerApiAxiosParamCreator(configuration).deleteAppClient(id, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: (configuration?.basePath || basePath) + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * Get an App Client by its UUID. Requires DASHBOARD_ADMIN or be an App Client Developer of that UUID.
         * @summary Get an App Client\'s Information
         * @param {string} id 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getAppClientRecord(id: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<AppClientUserDetailsDto>> {
            const localVarAxiosArgs = await AppClientControllerApiAxiosParamCreator(configuration).getAppClientRecord(id, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: (configuration?.basePath || basePath) + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * Retrieves application client user information.  Requires Dashboard Admin access or App Client Developer.
         * @summary Retrieves all application client user information
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getAppClientUsersWrapped(options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<AppClientUserDtoResponseWrapped>> {
            const localVarAxiosArgs = await AppClientControllerApiAxiosParamCreator(configuration).getAppClientUsersWrapped(options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: (configuration?.basePath || basePath) + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * Gets all the app client privileges so that privilege names can be mapped to their IDs. Must be a DASHBOARD_ADMIN or APP_CLIENT_DEVELOPER
         * @summary Gets all available privileges available for an app-client
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getClientTypePrivsWrapped(options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<PrivilegeDtoResponseWrapper>> {
            const localVarAxiosArgs = await AppClientControllerApiAxiosParamCreator(configuration).getClientTypePrivsWrapped(options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: (configuration?.basePath || basePath) + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * Updates an existing Application Client. Requires DASHBOARD_ADMIN access to change any attribute,or be APP_CLIENT_DEVELOPER role for app client of given UUID to be able to manage change App Client Developers - any of fields changed as APP_CLIENT_DEVELOPER will not be changed.
         * @summary Updates an existing Application Client
         * @param {string} id App Client ID to update
         * @param {AppClientUserDto} appClientUserDto 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async updateAppClient(id: string, appClientUserDto: AppClientUserDto, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<AppClientUserDto>> {
            const localVarAxiosArgs = await AppClientControllerApiAxiosParamCreator(configuration).updateAppClient(id, appClientUserDto, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: (configuration?.basePath || basePath) + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
    }
};

/**
 * AppClientControllerApi - factory interface
 * @export
 */
export const AppClientControllerApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    return {
        /**
         * Adds a App Client User. Requires DASHBOARD_ADMIN access.
         * @summary Adds an App Client
         * @param {AppClientUserDto} appClientUserDto 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createAppClientUser(appClientUserDto: AppClientUserDto, options?: any): AxiosPromise<AppClientUserDto> {
            return AppClientControllerApiFp(configuration).createAppClientUser(appClientUserDto, options).then((request) => request(axios, basePath));
        },
        /**
         * Deletes an existing App Client. Requires DASHBOARD_ADMIN access.
         * @summary Deletes an App Client
         * @param {string} id App Client ID to delete
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteAppClient(id: string, options?: any): AxiosPromise<AppClientUserDto> {
            return AppClientControllerApiFp(configuration).deleteAppClient(id, options).then((request) => request(axios, basePath));
        },
        /**
         * Get an App Client by its UUID. Requires DASHBOARD_ADMIN or be an App Client Developer of that UUID.
         * @summary Get an App Client\'s Information
         * @param {string} id 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAppClientRecord(id: string, options?: any): AxiosPromise<AppClientUserDetailsDto> {
            return AppClientControllerApiFp(configuration).getAppClientRecord(id, options).then((request) => request(axios, basePath));
        },
        /**
         * Retrieves application client user information.  Requires Dashboard Admin access or App Client Developer.
         * @summary Retrieves all application client user information
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAppClientUsersWrapped(options?: any): AxiosPromise<AppClientUserDtoResponseWrapped> {
            return AppClientControllerApiFp(configuration).getAppClientUsersWrapped(options).then((request) => request(axios, basePath));
        },
        /**
         * Gets all the app client privileges so that privilege names can be mapped to their IDs. Must be a DASHBOARD_ADMIN or APP_CLIENT_DEVELOPER
         * @summary Gets all available privileges available for an app-client
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getClientTypePrivsWrapped(options?: any): AxiosPromise<PrivilegeDtoResponseWrapper> {
            return AppClientControllerApiFp(configuration).getClientTypePrivsWrapped(options).then((request) => request(axios, basePath));
        },
        /**
         * Updates an existing Application Client. Requires DASHBOARD_ADMIN access to change any attribute,or be APP_CLIENT_DEVELOPER role for app client of given UUID to be able to manage change App Client Developers - any of fields changed as APP_CLIENT_DEVELOPER will not be changed.
         * @summary Updates an existing Application Client
         * @param {string} id App Client ID to update
         * @param {AppClientUserDto} appClientUserDto 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        updateAppClient(id: string, appClientUserDto: AppClientUserDto, options?: any): AxiosPromise<AppClientUserDto> {
            return AppClientControllerApiFp(configuration).updateAppClient(id, appClientUserDto, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * AppClientControllerApi - interface
 * @export
 * @interface AppClientControllerApi
 */
export interface AppClientControllerApiInterface {
    /**
     * Adds a App Client User. Requires DASHBOARD_ADMIN access.
     * @summary Adds an App Client
     * @param {AppClientUserDto} appClientUserDto 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AppClientControllerApiInterface
     */
    createAppClientUser(appClientUserDto: AppClientUserDto, options?: any): AxiosPromise<AppClientUserDto>;

    /**
     * Deletes an existing App Client. Requires DASHBOARD_ADMIN access.
     * @summary Deletes an App Client
     * @param {string} id App Client ID to delete
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AppClientControllerApiInterface
     */
    deleteAppClient(id: string, options?: any): AxiosPromise<AppClientUserDto>;

    /**
     * Get an App Client by its UUID. Requires DASHBOARD_ADMIN or be an App Client Developer of that UUID.
     * @summary Get an App Client\'s Information
     * @param {string} id 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AppClientControllerApiInterface
     */
    getAppClientRecord(id: string, options?: any): AxiosPromise<AppClientUserDetailsDto>;

    /**
     * Retrieves application client user information.  Requires Dashboard Admin access or App Client Developer.
     * @summary Retrieves all application client user information
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AppClientControllerApiInterface
     */
    getAppClientUsersWrapped(options?: any): AxiosPromise<AppClientUserDtoResponseWrapped>;

    /**
     * Gets all the app client privileges so that privilege names can be mapped to their IDs. Must be a DASHBOARD_ADMIN or APP_CLIENT_DEVELOPER
     * @summary Gets all available privileges available for an app-client
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AppClientControllerApiInterface
     */
    getClientTypePrivsWrapped(options?: any): AxiosPromise<PrivilegeDtoResponseWrapper>;

    /**
     * Updates an existing Application Client. Requires DASHBOARD_ADMIN access to change any attribute,or be APP_CLIENT_DEVELOPER role for app client of given UUID to be able to manage change App Client Developers - any of fields changed as APP_CLIENT_DEVELOPER will not be changed.
     * @summary Updates an existing Application Client
     * @param {string} id App Client ID to update
     * @param {AppClientUserDto} appClientUserDto 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AppClientControllerApiInterface
     */
    updateAppClient(id: string, appClientUserDto: AppClientUserDto, options?: any): AxiosPromise<AppClientUserDto>;

}

/**
 * AppClientControllerApi - object-oriented interface
 * @export
 * @class AppClientControllerApi
 * @extends {BaseAPI}
 */
export class AppClientControllerApi extends BaseAPI implements AppClientControllerApiInterface {
    /**
     * Adds a App Client User. Requires DASHBOARD_ADMIN access.
     * @summary Adds an App Client
     * @param {AppClientUserDto} appClientUserDto 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AppClientControllerApi
     */
    public createAppClientUser(appClientUserDto: AppClientUserDto, options?: any) {
        return AppClientControllerApiFp(this.configuration).createAppClientUser(appClientUserDto, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Deletes an existing App Client. Requires DASHBOARD_ADMIN access.
     * @summary Deletes an App Client
     * @param {string} id App Client ID to delete
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AppClientControllerApi
     */
    public deleteAppClient(id: string, options?: any) {
        return AppClientControllerApiFp(this.configuration).deleteAppClient(id, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Get an App Client by its UUID. Requires DASHBOARD_ADMIN or be an App Client Developer of that UUID.
     * @summary Get an App Client\'s Information
     * @param {string} id 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AppClientControllerApi
     */
    public getAppClientRecord(id: string, options?: any) {
        return AppClientControllerApiFp(this.configuration).getAppClientRecord(id, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Retrieves application client user information.  Requires Dashboard Admin access or App Client Developer.
     * @summary Retrieves all application client user information
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AppClientControllerApi
     */
    public getAppClientUsersWrapped(options?: any) {
        return AppClientControllerApiFp(this.configuration).getAppClientUsersWrapped(options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Gets all the app client privileges so that privilege names can be mapped to their IDs. Must be a DASHBOARD_ADMIN or APP_CLIENT_DEVELOPER
     * @summary Gets all available privileges available for an app-client
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AppClientControllerApi
     */
    public getClientTypePrivsWrapped(options?: any) {
        return AppClientControllerApiFp(this.configuration).getClientTypePrivsWrapped(options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Updates an existing Application Client. Requires DASHBOARD_ADMIN access to change any attribute,or be APP_CLIENT_DEVELOPER role for app client of given UUID to be able to manage change App Client Developers - any of fields changed as APP_CLIENT_DEVELOPER will not be changed.
     * @summary Updates an existing Application Client
     * @param {string} id App Client ID to update
     * @param {AppClientUserDto} appClientUserDto 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AppClientControllerApi
     */
    public updateAppClient(id: string, appClientUserDto: AppClientUserDto, options?: any) {
        return AppClientControllerApiFp(this.configuration).updateAppClient(id, appClientUserDto, options).then((request) => request(this.axios, this.basePath));
    }
}
