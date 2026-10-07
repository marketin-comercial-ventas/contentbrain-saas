// @ts-nocheck
import { db, eq, and, desc } from "@/server/db/client";
import { products, type Product, type NewProduct } from "@/server/db/schema";

export async function createProduct(companyId: string, data: Omit<NewProduct, "companyId">): Promise<Product> {
  const [product] = await db.insert(products).values({ companyId, ...data }).returning();
  return product;
}

export async function getProductById(id: string): Promise<Product | null> {
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return product ?? null;
}

export async function getProductsByCompany(companyId: string): Promise<Product[]> {
  return db.select().from(products).where(eq(products.companyId, companyId)).orderBy(desc(products.createdAt));
}

export async function updateProduct(id: string, data: Partial<Omit<NewProduct, "companyId">>): Promise<Product | null> {
  const [product] = await db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id)).returning();
  return product ?? null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const result = await db.delete(products).where(eq(products.id, id));
  return (result.rowCount ?? 0) > 0;
}