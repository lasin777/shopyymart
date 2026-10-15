import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, check, index } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: text('id').primaryKey(), name: text('name').notNull(), description: text('description').notNull(),
  category: text('category').notNull(), price: integer('price').notNull(), comparePrice: integer('compare_price'),
  stock: integer('stock').notNull().default(0), status: text('status').notNull().default('draft'),
  images: text('images').notNull().default('[]'), featured: integer('featured').notNull().default(0),
  version: integer('version').notNull().default(1), createdAt: integer('created_at').notNull(), updatedAt: integer('updated_at').notNull(),
}, t => [check('stock_nonnegative', sql`${t.stock} >= 0`), check('price_positive',sql`${t.price} > 0`), index('product_status').on(t.status)]);
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(), requestKey: text('request_key').notNull().unique(), requestHash: text('request_hash').notNull(),
  phone: text('phone').notNull(), customer: text('customer').notNull(), items: text('items').notNull(),
  subtotal: integer('subtotal').notNull(), shipping: integer('shipping').notNull(), total: integer('total').notNull(),
  status: text('status').notNull().default('new'), trackingUrl: text('tracking_url').notNull().default(''),
  note: text('note').notNull().default(''), version: integer('version').notNull().default(1),
  createdAt: integer('created_at').notNull(), updatedAt: integer('updated_at').notNull(),
},t=>[index('order_date').on(t.createdAt)]);
export const orderLines = sqliteTable('order_lines', {
  id: text('id').primaryKey(), orderId: text('order_id').notNull().references(()=>orders.id),
  productId: text('product_id').notNull().references(()=>products.id), quantity: integer('quantity').notNull(),
},t=>[check('quantity_positive',sql`${t.quantity} > 0`)]);
export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(), data: text('data').notNull(), version: integer('version').notNull().default(1),
});
export const rateLimits = sqliteTable('rate_limits', {
  id: text('id').primaryKey(), count: integer('count').notNull(), expiresAt: integer('expires_at').notNull(),
});
