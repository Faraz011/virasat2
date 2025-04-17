import { executeQuery } from "./db"

export type Product = {
  id: number
  name: string
  slug: string
  description: string
  price: number
  original_price: number | null
  category_id: number
  stock_quantity: number
  image_url: string
  is_featured: boolean
  is_new: boolean
  is_sale: boolean
  rating: number
  review_count: number
  material: string
  weave_type: string
  color: string
  category_name?: string
  category_slug?: string
}

export type Category = {
  id: number
  name: string
  slug: string
  description: string | null
  region: string | null
  image_url: string | null
}

export async function getCategories(): Promise<Category[]> {
  return await executeQuery("SELECT * FROM categories ORDER BY name")
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return await executeQuery(
    `
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_featured = true
    ORDER BY p.created_at DESC
    LIMIT $1
  `,
    [limit],
  )
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  return await executeQuery(
    `
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_new = true
    ORDER BY p.created_at DESC
    LIMIT $1
  `,
    [limit],
  )
}

export async function getSaleProducts(limit = 8): Promise<Product[]> {
  return await executeQuery(
    `
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_sale = true
    ORDER BY p.created_at DESC
    LIMIT $1
  `,
    [limit],
  )
}

export async function getProductsByCategory(categorySlug: string, limit = 20, offset = 0): Promise<Product[]> {
  return await executeQuery(
    `
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE c.slug = $1
    ORDER BY p.created_at DESC
    LIMIT $2 OFFSET $3
  `,
    [categorySlug, limit, offset],
  )
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await executeQuery(
    `
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.slug = $1
  `,
    [slug],
  )

  return products[0] || null
}

export async function getProductImages(productId: number) {
  return await executeQuery(
    `
    SELECT * FROM product_images
    WHERE product_id = $1
    ORDER BY is_primary DESC, display_order ASC
  `,
    [productId],
  )
}

export async function searchProducts(query: string, limit = 20): Promise<Product[]> {
  const searchTerm = `%${query}%`

  return await executeQuery(
    `
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 
      p.name ILIKE $1 OR
      p.description ILIKE $1 OR
      p.material ILIKE $1 OR
      p.weave_type ILIKE $1 OR
      p.color ILIKE $1 OR
      c.name ILIKE $1
    ORDER BY p.created_at DESC
    LIMIT $2
  `,
    [searchTerm, limit],
  )
}
