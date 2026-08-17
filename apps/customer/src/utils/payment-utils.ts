export const calculatePaystackFee = (amount: number): number => {
  const flatFee = parseFloat(
    import.meta.env.VITE_PAYSTACK_FLAT_FEE as string,
  );
  const percentageFee =
    parseFloat(import.meta.env.VITE_PAYSTACK_PERCENTAGE_FEE as string) / 100;

  let fee = amount * percentageFee + flatFee;

  // Waiving the NGN 100 fee for transactions under NGN 2,500
  if (amount < 2500) {
    fee -= flatFee;
  }

  return fee;
};
