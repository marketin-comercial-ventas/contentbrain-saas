import { db, and, desc, eq } from "@/server/db/client";
import { products, type NewProduct, type Product } from "@/server/db/schema";

/** Fields accepted by the catalog service. Storage aliases stay internal. */
export type ProductWrite = Omit<NewProduct, "companyId" | "legacyPrice"> & {
  /** Transitional request alias; `price` always takes precedence. */
  basePrice?: number;
};
export type ProductPatch = Partial<ProductWrite>;
export type ProductView = Omit<Product, "legacyPrice">;

function slugify(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "producto";
}

/**
 * Reads the canonical base_price value, falling back to the original price
 * column for rows created before the advanced catalog migration.
 */
function normalizeProduct(product: Product): ProductView {
  const { legacyPrice, ...view } = product;
  const price = product.price !== 0 || legacyPrice === 0 ? product.price : legacyPrice;
  return { ...view, price };
}

function byId(id: string, companyId?: string) {
  return companyId
    ? and(eq(products.id, id), eq(products.companyId, companyId))
    : eq(products.id, id);
}

export async function createProduct(companyId: string, data: ProductWrite): Promise<ProductView> {
  const { basePrice, ...input } = data;
  const price = input.price ?? basePrice ?? 0;
  const values = {
    ...input,
    companyId,
    slug: input.slug ?? slugify(input.name),
    price,
    // Keep the legacy column synchronized until it can be retired safely.
    legacyPrice: price,
  };
  const [product] = await db.insert(products).values(values).returning();
  if (!product) throw new Error("No se pudo crear el producto");
  return normalizeProduct(product);
}

export async function getProductById(id: string, companyId?: string): Promise<ProductView | null> {
  const [product] = await db.select().from(products).where(byId(id, companyId)).limit(1);
  return product ? normalizeProduct(product) : null;
}

export async function getProductsByCompany(companyId: string): Promise<ProductView[]> {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.companyId, companyId))
    .orderBy(desc(products.createdAt));
  return rows.map(normalizeProduct);
}

export async function updateProduct(
  id: string,
  data: ProductPatch,
  companyId?: string,
): Promise<ProductView | null> {
  const { basePrice, legacyPrice: _legacyPrice, ...input } = data as ProductPatch & {
    basePrice?: number;
    legacyPrice?: unknown;
  };
  const nextPrice = input.price ?? basePrice;
  const updates = {
    ...input,
    ...(nextPrice !== undefined ? { price: nextPrice, legacyPrice: nextPrice } : {}),
    updatedAt: new Date(),
  };
  const [product] = await db.update(products).set(updates).where(byId(id, companyId)).returning();
  return product ? normalizeProduct(product) : null;
}

export async function deleteProduct(id: string, companyId?: string): Promise<boolean> {
  const result = await db.delete(products).where(byId(id, companyId));
  return result.length > 0;
}
