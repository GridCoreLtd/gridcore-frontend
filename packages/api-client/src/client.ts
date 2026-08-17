import axios, { type AxiosInstance } from "axios";
import Cookies from "js-cookie";

/**
 * The base URL is passed in rather than read here: the console and customer
 * apps are Vite (`VITE_BASE_URL`) and the website is Astro (`PUBLIC_BASE_URL`),
 * and `import.meta.env` is resolved by whichever bundler compiles the file.
 */
interface ClientOptions {
  baseURL?: string;
  /** Called instead of a hard redirect when the session turns out to be gone. */
  onExpired?: () => void;
}

/**
 * No client shows a toast.
 *
 * The interceptor used to `toast.error(...)` on every rejection, which meant a
 * background read failing on mount shouted at a user who had done nothing, and
 * every mutation double-reported — once vaguely here, once specifically at the
 * call site. Messaging belongs where the intent is known; see
 * architecture/10-api-errors.md.
 */
const forwardRejection = (client: AxiosInstance) => {
  client.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
  );
  return client;
};

/** For the marketing site: no session, no credentials, no redirect. */
export function createPublicClient({ baseURL }: ClientOptions): AxiosInstance {
  return forwardRejection(axios.create({ baseURL }));
}

/**
 * The v2 transport: the session is an opaque id in an HttpOnly cookie, so this
 * sends credentials and holds none. There is nothing here to read, attach, or
 * clear — the browser does all three, and `POST /v1/auth/logout` is what ends a
 * session (D-011, D-051).
 *
 * Same-site is what makes the cookie travel: the console is served from
 * `console.<domain>` and the API from `api.<domain>`, so `SameSite=Lax` sends
 * it. From a bare `localhost` dev server it is silently never sent and every
 * request answers 401.
 */
export function createSessionClient({
  baseURL,
  onExpired,
}: ClientOptions): AxiosInstance {
  const client = axios.create({ baseURL, withCredentials: true });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // `error.response` is absent for network failures, timeouts, CORS
      // rejections and cancelled requests — reading it unguarded used to make
      // this interceptor itself throw.
      //
      // 401 is the only status handled here. A 403 `password_change_required`
      // and a 409 `merchant_selection_required` are routing instructions rather
      // than failures (doc 14), and belong where the intent is known.
      if (error?.response?.status === 401) {
        onExpired?.();
      }

      return Promise.reject(error);
    }
  );

  return client;
}

/**
 * The legacy transport, named for what it is.
 *
 * A bearer token in a JavaScript-readable cookie — which is the credential
 * model D-011 replaced, and which every screen still pointed at `mock-api`
 * depends on. It is not a second opinion about how sessions work; it is the
 * old one, kept alive only until the last legacy screen ports.
 */
export function createLegacyClient({ baseURL }: ClientOptions): AxiosInstance {
  const client = axios.create({ baseURL });

  client.interceptors.request.use(
    (config) => {
      const token = Cookies.get("access_token");
      if (token) config.headers["Authorization"] = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        Cookies.remove("access_token");
        localStorage.removeItem("user");

        if (window.location.pathname !== "/") {
          window.location.href = "/";
          return new Promise(() => {}); // navigating away; surface nothing
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
}
