import { executeQuery } from "./db"
import { getCurrentUser } from "./auth"

export type CartItem = {
  id: number
  product_id: number
  quantity: number
  name: string
  price: number
  original_price: number | null
  image_url: string
  slug: string
}

export async function getCart(): Promise<CartItem[]> {
  const user = await getCurrentUser()

  if (!user) return []

  return await executeQuery(
    `
    SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.original_price, p.image_url, p.slug
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = $1
  `,
    [user.id],
  )
}

export async function addToCart(productId: number, quantity = 1) {
  const user = await getCurrentUser()

  if (!user) throw new Error("You must be logged in to add items to cart")

  // Check if product exists and has enough stock
  const product = await executeQuery("SELECT id, stock_quantity FROM products WHERE id = $1", [productId])

  if (!product[0]) throw new Error("Product not found")
  if (product[0].stock_quantity < quantity) throw new Error("Not enough stock available")

  // Check if item already exists in cart
  const existingItem = await executeQuery(
    "SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2",
    [user.id, productId],
  )

  if (existingItem[0]) {
    // Update quantity if item exists
    const newQuantity = existingItem[0].quantity + quantity

    if (newQuantity > product[0].stock_quantity) {
      throw new Error("Not enough stock available")
    }

    await executeQuery("UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
      newQuantity,
      existingItem[0].id,
    ])
  } else {
    // Add new item to cart
    await executeQuery("INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)", [
      user.id,
      productId,
      quantity,
    ])
  }

  return getCart()
}

export async function updateCartItem(cartItemId: number, quantity: number) {
  const user = await getCurrentUser()

  if (!user) throw new Error("You must be logged in to update cart")

  // Get cart item and check ownership
  const cartItem = await executeQuery(
    "SELECT ci.id, ci.product_id, p.stock_quantity FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = $1 AND ci.user_id = $2",
    [cartItemId, user.id],
  )

  if (!cartItem[0]) throw new Error("Cart item not found")

  // Check stock
  if (quantity > cartItem[0].stock_quantity) {
    throw new Error("Not enough stock available")
  }

  if (quantity <= 0) {
    // Remove item if quantity is 0 or negative
    await executeQuery("DELETE FROM cart_items WHERE id = $1", [cartItemId])
  } else {
    // Update quantity
    await executeQuery("UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
      quantity,
      cartItemId,
    ])
  }

  return getCart()
}

export async function removeFromCart(cartItemId: number) {
  const user = await getCurrentUser()

  if (!user) throw new Error("You must be logged in to remove items from cart")

  await executeQuery("DELETE FROM cart_items WHERE id = $1 AND user_id = $2", [cartItemId, user.id])

  return getCart()
}

export async function clearCart() {
  const user = await getCurrentUser()

  if (!user) throw new Error("You must be logged in to clear cart")

  await executeQuery("DELETE FROM cart_items WHERE user_id = $1", [user.id])

  return []
}
