# @autorunai/fetcher

**Built by Autorun**
This package is developed and maintained by [Autorun](https://autorun.ai/), an AI-powered platform for building and deploying intelligent applications. If you need enterprise support or custom integrations, contact us at [hello@autorun.ai](mailto:hello@autorun.ai).

A powerful, type-safe fetch wrapper with hooks, error handling, and flexible configuration for modern web applications.

## Features

- 🔒 **Type-safe** - Full TypeScript support with generic constraints
- 🎣 **Hook system** - Intercept and customize request/response lifecycle
- ⚡ **Zero dependencies** - Built on native fetch API
- 🛠 **Flexible configuration** - Base URL, default options, custom headers
- 🎯 **Method-specific types** - Different types for GET/DELETE vs POST/PUT/PATCH
- 🚫 **Smart error handling** - Configurable via hooks, no forced throwing
- 📦 **Tree-shakeable** - ESM with no side effects

## Installation

```bash
npm install @autorunai/fetcher
```

```bash
yarn add @autorunai/fetcher
```

```bash
pnpm add @autorunai/fetcher
```

```bash
bun add @autorunai/fetcher
```

## Quick Start

```typescript
import { createFetcher } from '@autorunai/fetcher'

const api = createFetcher({
  baseUrl: 'https://api.example.com'
})

/* GET request */
const { data, response } = await api.get({
  url: '/users'
}).json<User[]>()

/* POST request */
const { data } = await api.post({
  url: '/users',
  data: { name: 'John', email: 'john@example.com' }
}).json<User>()
```

## Configuration

```typescript
const api = createFetcher({
  baseUrl: 'https://api.example.com',
  fetch: {
    headers: {
      'Authorization': 'Bearer token'
    }
  }
})
```

## Hook System

### Request Transformation

```typescript
const api = createFetcher({
  hooks: {
    onBeforeRequest: (url, init) => {
      /* Add auth token */
      init.headers = {
        ...init.headers,
        'Authorization': `Bearer ${getToken()}`
      }
      return [url, init]
    }
  }
})
```

### Error Handling

```typescript
const api = createFetcher({
  hooks: {
    onFetchResourceError: (url, init) => {
      console.error('Network error:', url)
      /* Let default error throw */
    },

    onJsonTransformError: ({ response }) => {
      console.error('Invalid JSON from:', response.url)
      /* Throw custom error */
      throw new Error('Server returned invalid data')
    },

    onResponseNotOkError: ({ response, data }) => {
      if (response.status === 401) {
        redirectToLogin()
        return /* Don't throw, handle gracefully */
      }
      /* Let other errors be handled manually */
    }
  }
})
```

```typescript
/* Custom error class */
class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const api = createFetcher({
  hooks: {
    onFetchResourceError: (url, init) => {
      console.error('Network error:', url)
      /* Let default error throw */
    },

    onJsonTransformError: ({ response }) => {
      console.error('Invalid JSON from:', response.url)
      /* Throw custom error */
      throw new Error('Server returned invalid data')
    },

    onResponseNotOkError: ({ response, data }) => {
      if (response.status === 401) {
        redirectToLogin()
        return /* Don't throw, handle gracefully */
      }

      /* Throw custom error class */
      throw new ApiError(
        response.status,
        data,
        `API Error: ${response.status} ${response.statusText}`
      )
    }
  }
})

/* Usage with custom error handling */
try {
  const { data } = await api.get({ url: '/users' }).json()
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API failed with ${error.status}:`, error.data)
  }
}
```

## Default thrown errors

```typescript
import { EXCEPTION } from '@autorunai/fetcher'

try {
  await api.get({ url: '/test' }).json()
} catch (error) {
  if (error.message === EXCEPTION.RESPONSE) {
    /* Network/fetch error */
  }
  if (error.message === EXCEPTION.JSON) {
    /* Invalid JSON response */
  }
}
```

### Response Logging

```typescript
const api = createFetcher({
  hooks: {
    onResponseOk: ({ response, data }) => {
      console.log(`✅ ${response.status} ${response.url}`)
    }
  }
})
```

## Advanced Usage

### Custom Headers per Request

```typescript
const { data } = await api.post({
  url: '/upload',
  data: formData,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
}).json()
```

### URL Path Parameters

```typescript
const api = createFetcher<`/users/${string}` | '/users'>({
  baseUrl: 'https://api.example.com'
})

/* TypeScript will enforce correct URL patterns */
await api.get({ url: '/users/123' }).json()
await api.get({ url: '/users' }).json()
```

## API Reference

### createFetcher(config?)

Creates a new fetcher instance.

**Parameters:**
- `config.baseUrl` - URL prefix for all requests
- `config.fetch` - Default fetch options
- `config.hooks` - Lifecycle hooks

### Methods

- `get(options)` - GET request (no body)
- `post(options)` - POST request (requires data)
- `put(options)` - PUT request (requires data)
- `patch(options)` - PATCH request (requires data)
- `delete(options)` - DELETE request (no body)

### Options

**Body-less methods (GET, DELETE):**
```typescript
{
  url: string
  headers?: Record<string, string>
  /* ...other RequestInit options except method/body */
}
```

**Body-full methods (POST, PUT, PATCH):**
```typescript
{
  url: string
  data: unknown  /* Will be JSON.stringify'd */
  headers?: Record<string, string>
  /* ...other RequestInit options except method/body */
}
```

## TypeScript Support

Full type inference and safety:

```typescript
interface User {
  id: number
  name: string
  email: string
}

/* Return type automatically inferred as User[] */
const users = await api.get({ url: '/users' }).json<User[]>()

/* TypeScript enforces data property for POST */
const newUser = await api.post({
  url: '/users',
  data: { name: 'John', email: 'john@example.com' }
}).json<User>()
```

## License

MIT © autorun
