import axios, { AxiosInstance } from 'axios';
import { axiosAuthErrorResponseInterceptor, axiosAuthSuccessResponseInterceptor } from './openapi-axios';

abstract class HttpClient {
    protected readonly instance: AxiosInstance;

    public constructor(baseURL: string) {
        this.instance = axios.create({
            baseURL,
        });

        this.instance.interceptors.response.use(axiosAuthSuccessResponseInterceptor, axiosAuthErrorResponseInterceptor);
    }

    get axiosInstance(): AxiosInstance {
        return this.instance;
    }
}

export default HttpClient;