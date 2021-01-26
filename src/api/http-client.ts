import axios, { AxiosInstance, AxiosResponse } from 'axios';

// declare module 'axios' {
//     interface AxiosResponse<T = any> extends Promise<T> { }
// }

abstract class HttpClient {
    protected readonly instance: AxiosInstance;

    public constructor(baseURL: string) {
        this.instance = axios.create({
            baseURL,
        });
    }
}

export default HttpClient;