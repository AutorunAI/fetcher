const EXCEPTION = {
	RESPONSE: "[Fetcher]: Network request failed",
	JSON: "[Fetcher]: Response is not valid JSON",
} as const

type FetcherBodyLessInit = Omit<RequestInit, "method" | "body">
type FetcherBodyFullInit = FetcherBodyLessInit & { data: unknown }

type FetcherBodyLessOptions<TUrl = string> = { url: TUrl } & FetcherBodyLessInit
type FetcherBodyFullOptions<TUrl = string> = { url: TUrl } & FetcherBodyFullInit
type FetcherOptions<TUrl = string> = { url: TUrl } & (FetcherBodyLessInit | FetcherBodyFullInit)

type FetcherConfig<TUrl = string> = {
	/** Url prefix that is added to each url the fetcher calls */
	baseUrl?: string

	/** Default options to be passed to fetch on request. Specific default properties are overridden when passed on request as well. */
	fetch?: Omit<FetcherOptions<TUrl>, "url" | "method">

	/** Handlers for fetcher events */
	hooks?: {
		/**
		 * Executed before a fetch request is made, allowing modification of request params
		 * @param url - The URL being passed to fetch
		 * @param init - The request init object being passed to fetch
		 * @returns Modified fetch parameters tuple [url, init]
		 */
		onBeforeRequest?: (url: string, init: RequestInit) => [string, RequestInit]

		/**
		 * Handles errors that occur during the fetch call
		 * @param url - The URL that failed
		 * @param init - The request init object that failed
		 * @returns Either void (use default error) or never (throw custom error)
		 */
		onFetchResourceError?:
			| ((url: string, init: RequestInit) => never)
			| ((url: string, init: RequestInit) => void)

		/**
		 * Handles errors that occur when parsing the JSON response
		 * @param props - Object containing the fetch Response
		 * @returns Either void (use default error) or never (throw custom error)
		 */
		onJsonTransformError?:
			| ((props: { response: Response }) => never)
			| ((props: { response: Response }) => void)

		/**
		 * Handles responses with non-2xx status codes
		 * @param props - Object containing the Response and parsed JSON data
		 * @returns Either void (use default error) or never (throw custom error)
		 */
		onResponseNotOkError?:
			| ((props: { response: Response; data: unknown }) => never)
			| ((props: { response: Response; data: unknown }) => void)

		/**
		 * Executed after a successful response with parsed JSON
		 * @param props - Object containing the Response and parsed JSON data
		 * @returns Either void (continue) or never (throw custom error)
		 */
		onResponseOk?:
			| ((props: { response: Response; data: unknown }) => never)
			| ((props: { response: Response; data: unknown }) => void)
	}
}

type FetcherHttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

/* biome-ignore lint/suspicious/noExplicitAny: perf optimization, use same empty object on nullable prop */
const EMPTY_RECORD: Record<any, any> = Object.freeze({})

/** Creates a powerful type-safe fetch wrapper instance */
const createFetcher = <TUrl = string>(
	{
		baseUrl,
		hooks,
		fetch: fetchOptions = EMPTY_RECORD as Omit<FetcherOptions<TUrl>, "method" | "url">,
		...defaultOptions
	}: FetcherConfig<TUrl> = EMPTY_RECORD as FetcherConfig<TUrl>,
) => {
	const {
		onBeforeRequest,
		onFetchResourceError,
		onJsonTransformError,
		onResponseNotOkError,
		onResponseOk,
	} = hooks ?? (EMPTY_RECORD as NonNullable<FetcherConfig<TUrl>["hooks"]>)

	const buildRequest = (
		method: FetcherHttpMethod,
		{ url, ...options }: FetcherOptions<TUrl>,
	): [string, RequestInit] => {
		const requestUrl = baseUrl ? `${baseUrl}${url}` : (url as string)
		const requestInit = {
			method,
			...defaultOptions,
			...fetchOptions,
			...options,
		} as RequestInit

		if (onBeforeRequest) {
			return onBeforeRequest(requestUrl, requestInit)
		}

		return [requestUrl, requestInit]
	}

	const request = (method: FetcherHttpMethod, options: FetcherOptions<TUrl>) => ({
		json: async <T>(): Promise<{ response: Response; data: T }> => {
			const headers = {
				"Content-Type": "application/json",
			} as const

			const mergedOptions =
				"data" in options && options.data
					? { ...options, body: JSON.stringify(options.data), headers }
					: { ...options, headers }

			const [requestUrl, requestInit] = buildRequest(method, mergedOptions)

			const response = await fetch(requestUrl, requestInit).catch(() => {
				if (onFetchResourceError) {
					onFetchResourceError(requestUrl, requestInit)
				}

				throw new Error(EXCEPTION.RESPONSE)
			})

			const data = await response.json().catch(() => {
				if (onJsonTransformError) {
					onJsonTransformError({ response })
				}

				throw new Error(EXCEPTION.JSON)
			})

			if (!response.ok) {
				if (onResponseNotOkError) {
					onResponseNotOkError({ response, data })
				}
			}

			if (onResponseOk) {
				onResponseOk({ response, data })
			}

			return { response, data: data as T }
		},
	})

	return {
		get: (options: FetcherBodyLessOptions<TUrl>) => request("GET", options),
		post: (options: FetcherBodyFullOptions<TUrl>) => request("POST", options),
		put: (options: FetcherBodyFullOptions<TUrl>) => request("PUT", options),
		patch: (options: FetcherBodyFullOptions<TUrl>) => request("PATCH", options),
		delete: (options: FetcherBodyLessOptions<TUrl>) => request("DELETE", options),
	}
}

export { createFetcher, EXCEPTION }
export type {
	FetcherBodyFullInit,
	FetcherBodyFullOptions,
	FetcherBodyLessInit,
	FetcherBodyLessOptions,
	FetcherConfig,
	FetcherHttpMethod,
	FetcherOptions,
}
export default createFetcher
