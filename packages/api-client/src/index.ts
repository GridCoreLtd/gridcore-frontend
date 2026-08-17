/**
 * The API contract shared by every app.
 *
 * Today that is the RFC 9457 error layer from architecture/10-api-errors.md.
 * The generated OpenAPI client lands here too, which is why this is a package
 * rather than another file in `packages/ui`.
 */
export * from "./api-error";
export * from "./client";
export * from "./session";
