export const getDiscountedPrice = (price, discount) => {
  return price - (price * discount) / 100;
};
