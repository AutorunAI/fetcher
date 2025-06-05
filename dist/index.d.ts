declare const EXCEPTION: {
    readonly RESPONSE: "[Fetcher]: Network request failed";
    readonly JSON: "[Fetcher]: Response is not valid JSON";
};
type FetcherBodyLessInit = Omit<RequestInit, "method" | "body">;
type FetcherBodyFullInit = FetcherBodyLessInit & {
    data: unknown;
};
type FetcherBodyLessOptions<TUrl = string> = {
    url: TUrl;
} & FetcherBodyLessInit;
type FetcherBodyFullOptions<TUrl = string> = {
    url: TUrl;
} & FetcherBodyFullInit;
type FetcherOptions<TUrl = string> = {
    url: TUrl;
} & (FetcherBodyLessInit | FetcherBodyFullInit);
type FetcherConfig<TUrl = string> = {
    /** Url prefix that is added to each url the fetcher calls */
    baseUrl?: string;
    /** Default options to be passed to fetch on request. Specific default properties are overridden when passed on request as well. */
    fetch?: Omit<FetcherOptions<TUrl>, "url" | "method">;
    /** Handlers for fetcher events */
    hooks?: {
        /**
         * Executed before a fetch request is made, allowing modification of request params
         * @param url - The URL being passed to fetch
         * @param init - The request init object being passed to fetch
         * @returns Modified fetch parameters tuple [url, init]
         */
        onBeforeRequest?: (url: string, init: RequestInit) => [string, RequestInit];
        /**
         * Handles errors that occur during the fetch call
         * @param url - The URL that failed
         * @param init - The request init object that failed
         * @returns Either void (use default error) or never (throw custom error)
         */
        onFetchResourceError?: ((url: string, init: RequestInit) => never) | ((url: string, init: RequestInit) => void);
        /**
         * Handles errors that occur when parsing the JSON response
         * @param props - Object containing the fetch Response
         * @returns Either void (use default error) or never (throw custom error)
         */
        onJsonTransformError?: ((props: {
            response: Response;
        }) => never) | ((props: {
            response: Response;
        }) => void);
        /**
         * Handles responses with non-2xx status codes
         * @param props - Object containing the Response and parsed JSON data
         * @returns Either void (use default error) or never (throw custom error)
         */
        onResponseNotOkError?: ((props: {
            response: Response;
            data: unknown;
        }) => never) | ((props: {
            response: Response;
            data: unknown;
        }) => void);
        /**
         * Executed after a successful response with parsed JSON
         * @param props - Object containing the Response and parsed JSON data
         * @returns Either void (continue) or never (throw custom error)
         */
        onResponseOk?: ((props: {
            response: Response;
            data: unknown;
        }) => never) | ((props: {
            response: Response;
            data: unknown;
        }) => void);
    };
};
type FetcherHttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
/** Creates a powerful type-safe fetch wrapper instance */
declare const createFetcher: <TUrl = string>({ baseUrl, hooks, fetch: fetchOptions, ...defaultOptions }?: FetcherConfig<TUrl>) => {
    get: (options: FetcherBodyLessOptions<TUrl>) => {
        json: <T>() => Promise<{
            response: Response;
            data: T;
        }>;
    };
    post: (options: FetcherBodyFullOptions<TUrl>) => {
        json: <T>() => Promise<{
            response: Response;
            data: T;
        }>;
    };
    put: (options: FetcherBodyFullOptions<TUrl>) => {
        json: <T>() => Promise<{
            response: Response;
            data: T;
        }>;
    };
    patch: (options: FetcherBodyFullOptions<TUrl>) => {
        json: <T>() => Promise<{
            response: Response;
            data: T;
        }>;
    };
    delete: (options: FetcherBodyLessOptions<TUrl>) => {
        json: <T>() => Promise<{
            response: Response;
            data: T;
        }>;
    };
};

export { EXCEPTION, createFetcher, createFetcher as default };
export type { FetcherBodyFullInit, FetcherBodyFullOptions, FetcherBodyLessInit, FetcherBodyLessOptions, FetcherConfig, FetcherHttpMethod, FetcherOptions };
