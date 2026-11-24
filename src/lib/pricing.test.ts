// Run: node --experimental-strip-types src/lib/pricing.test.ts  (Node 22+), or: npx tsx src/lib/pricing.test.ts
import assert from 'node:assert/strict';
import { totals, unitPrice, discountPercent } from './pricing';

const ship = { charges: 200, freeOver: 2000 };
assert.deepEqual(totals(1500, ship), { subtotal: 1500, discount: 0, shipping: 200, total: 1700 });
assert.deepEqual(totals(2000, ship), { subtotal: 2000, discount: 0, shipping: 0, total: 2000 });
assert.deepEqual(totals(0, ship).total, 0);
assert.equal(totals(3000, ship, { code: 'A', type: 'percent', value: 10, min_subtotal: 0 }).total, 2700);
assert.equal(totals(1000, ship, { code: 'A', type: 'fixed', value: 5000, min_subtotal: 0 }).discount, 1000);
assert.equal(totals(1000, ship, { code: 'A', type: 'fixed', value: 100, min_subtotal: 2000 }).discount, 0);
assert.equal(unitPrice({ price: 3590, sale_price: 2350 }), 2350);
assert.equal(unitPrice({ price: 3590, sale_price: null }), 3590);
assert.equal(discountPercent({ price: 3590, sale_price: 2350 }), 35);
console.log('pricing ok');
