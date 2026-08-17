import { createPublicClient } from "@gridcore/api-client";

const baseURL = import.meta.env.PUBLIC_BASE_URL;

if (import.meta.env.DEV && !baseURL) {
  // Without this, axios falls back to the page origin and every API call 404s
  // against the static site, which surfaces only as a form that will not submit.
  console.warn(
    "[gridcore] PUBLIC_BASE_URL is not set. Copy .env.example to .env — " +
      "API requests will otherwise resolve against the website origin and fail."
  );
}

export default createPublicClient({ baseURL });
