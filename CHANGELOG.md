# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2025-06-05

### Fixed
- Fixed README.md encoding issue (UTF-16 to UTF-8)
- Improved package documentation display on npm

## [1.0.0] - 2025-06-05

### Added
- Initial release of @autorunai/fetcher
- Type-safe fetch wrapper with full TypeScript support
- Comprehensive hook system for request/response lifecycle
- Method-specific types (body-less vs body-full methods)
- Flexible error handling via hooks
- Support for custom error classes
- Base URL and default options configuration
- Zero dependencies - built on native fetch API
- Tree-shakeable ESM modules
- Complete TypeScript type definitions

### Features
- createFetcher() function for creating configured instances
- HTTP methods: GET, POST, PUT, PATCH, DELETE
- Hook system:
  - onBeforeRequest - Request transformation
  - onFetchResourceError - Network error handling
  - onJsonTransformError - JSON parsing error handling
  - onResponseNotOkError - HTTP error status handling
  - onResponseOk - Success response handling
- Built-in error constants (EXCEPTION.RESPONSE, EXCEPTION.JSON)
- Generic URL path parameter support
- Automatic JSON serialization for request bodies
- Full Response object access alongside parsed data

