const CART_KEY_PREFIX = "cart_";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
  variants: Record<string, string>;
  stockQuantity?: number;
}

export function getCart(storeId: string): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(`${CART_KEY_PREFIX}${storeId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCart(storeId: string, cart: CartItem[]): void {
  localStorage.setItem(`${CART_KEY_PREFIX}${storeId}`, JSON.stringify(cart));
}

export function addToCart(
  storeId: string,
  item: CartItem
): { capped: boolean; available: number } {
  const cart = getCart(storeId);
  const existingIndex = cart.findIndex(
    (i) =>
      i.productId === item.productId &&
      JSON.stringify(i.variants) === JSON.stringify(item.variants)
  );
  const stock = item.stockQuantity;
  let capped = false;

  if (existingIndex >= 0) {
    const newQty = cart[existingIndex].quantity + item.quantity;
    if (stock != null && newQty > stock) {
      cart[existingIndex].quantity = stock;
      capped = true;
    } else {
      cart[existingIndex].quantity = newQty;
    }
    if (stock != null) {
      cart[existingIndex].stockQuantity = stock;
    }
  } else {
    const cartItem = { ...item };
    if (stock != null && cartItem.quantity > stock) {
      cartItem.quantity = stock;
      capped = true;
    }
    cart.push(cartItem);
  }
  saveCart(storeId, cart);
  return { capped, available: stock ?? 0 };
}

export function updateQuantity(
  storeId: string,
  productId: string,
  quantity: number
): void {
  const cart = getCart(storeId);
  const index = cart.findIndex((i) => i.productId === productId);
  if (index >= 0) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = quantity;
    }
  }
  saveCart(storeId, cart);
}

export function removeFromCart(storeId: string, productId: string): void {
  const cart = getCart(storeId).filter((i) => i.productId !== productId);
  saveCart(storeId, cart);
}

export function clearCart(storeId: string): void {
  localStorage.removeItem(`${CART_KEY_PREFIX}${storeId}`);
}

export function getCartTotal(storeId: string): number {
  return getCart(storeId).reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}

export function getCartCount(storeId: string): number {
  return getCart(storeId).reduce((count, item) => count + item.quantity, 0);
}
