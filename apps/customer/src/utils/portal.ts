/**
 * The subdomain names the merchant (D-020): one build serves every portal, and
 * the leftmost label is the whole of the routing.
 */
export const portalSlug = () => window.location.hostname.split(".")[0];
