/**
 * A failure that names no field. The API deliberately says nothing specific
 * about a rejected sign-in — telling the caller which half was wrong turns
 * login into a way to discover who is registered (doc 14).
 */
export default function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {message}
    </p>
  );
}
