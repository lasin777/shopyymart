// These guards execute inside the same D1 batch transaction as the order insert.
// Invalid, archived, repriced or exhausted inventory aborts the entire transaction.
export const reserveLineSQL = `INSERT INTO order_lines (id,order_id,product_id,quantity)
VALUES (?,?,?,(SELECT CASE WHEN status='live' AND stock>=? AND price=? THEN ? ELSE 0 END FROM products WHERE id=?))`;
export const decrementStockSQL = `UPDATE products SET stock=stock-?,version=version+1,updated_at=? WHERE id=?`;
export const guardOrderVersionSQL = `INSERT INTO order_lines (id,order_id,product_id,quantity)
SELECT ?,?,?,0 WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id=? AND version=?)`;
