import axios, { AxiosInstance, AxiosResponse } from 'axios';

declare module 'axios' {
    interface AxiosResponse<T = any> extends Promise<T> { }
}

abstract class HttpClient {
    protected readonly instance: AxiosInstance;

    public constructor(baseURL: string) {
        this.instance = axios.create({
            baseURL,
        });

        this.initResponseInterceptor();
    }

    private initResponseInterceptor() {
        this.instance.interceptors.response.use(
            this.handleResponse,
            this.handleError,
        );
    };

    private handleResponse({ data }: AxiosResponse) {
        return data;
    }

    private handleError(error: any) {
        Promise.reject(error);
    }
}

export default HttpClient;