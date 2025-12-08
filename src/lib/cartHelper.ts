// Add this helper file: lib/cartHelpers.ts

export async function addToCart(userId: number, productId: number, quantity: number = 1) {
  try {
    // Get or create cart for user
    const cartsRes = await fetch('/api/cart');
    const carts = await cartsRes.json();
    let userCart = carts.find((c: any) => c.user_id === userId);

    if (!userCart) {
      // Create cart if doesn't exist
      const createRes = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      userCart = await createRes.json();
    }

    // Check if product already in cart
    const cartRes = await fetch(`/api/cart/${userCart.cart_id}`);
    const cartData = await cartRes.json();
    const existingItem = cartData.cartItems?.find(
      (item: any) => item.product_id === productId
    );

    if (existingItem) {
      // Update quantity if item exists
      await fetch(`/api/cart-items/${existingItem.cart_item_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: existingItem.quantity + quantity,
        }),
      });
    } else {
      // Add new item to cart
      await fetch('/api/cart-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart_id: userCart.cart_id,
          product_id: productId,
          quantity: quantity,
        }),
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, error };
  }
}

export async function getCartItemCount(userId: number): Promise<number> {
  try {
    const cartsRes = await fetch('/api/cart');
    const carts = await cartsRes.json();
    const userCart = carts.find((c: any) => c.user_id === userId);

    if (!userCart) return 0;

    const cartRes = await fetch(`/api/cart/${userCart.cart_id}`);
    const cartData = await cartRes.json();
    
    return cartData.cartItems?.reduce(
      (total: number, item: any) => total + item.quantity,
      0
    ) || 0;
  } catch (error) {
    console.error('Error getting cart count:', error);
    return 0;
  }
}