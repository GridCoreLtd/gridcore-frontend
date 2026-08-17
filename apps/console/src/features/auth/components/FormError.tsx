
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
