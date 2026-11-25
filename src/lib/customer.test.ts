import assert from 'node:assert/strict';
import { customerToken, verifyCustomerToken } from './customer';
process.env.SESSION_SECRET = 'x'.repeat(40); // read at call time, so setting it after import is fine

const exp = Math.floor(Date.now() / 1000) + 60;
const tok = customerToken('03001234567', exp);
assert.equal(verifyCustomerToken(tok), '03001234567');
assert.equal(verifyCustomerToken(tok.replace('03001234567', '03007654321')), null, 'swapped phone must fail');
assert.equal(verifyCustomerToken(customerToken('03001234567', exp - 120)), null, 'expired must fail');
assert.equal(verifyCustomerToken(`${exp}.${tok.split('.')[2]}`), null, 'admin-shaped cookie must fail');
assert.equal(verifyCustomerToken(undefined), null);
console.log('customer token ok');
