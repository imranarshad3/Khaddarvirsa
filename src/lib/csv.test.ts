import assert from 'node:assert/strict';
import { parseCsv } from './csv';

assert.deepEqual(parseCsv('﻿"ID","Title","Price"\r\n"1","Shawl, ""Royal""","3000"\r\n'), [{ id: '1', title: 'Shawl, "Royal"', price: '3000' }]);
assert.deepEqual(parseCsv('id,price\n2,1500\n\n3,'), [{ id: '2', price: '1500' }, { id: '3', price: '' }]);
assert.deepEqual(parseCsv('id,note\n4,"line1\nline2"'), [{ id: '4', note: 'line1\nline2' }]);
assert.deepEqual(parseCsv("id,title\n5,'-50% off"), [{ id: '5', title: '-50% off' }]);
assert.deepEqual(parseCsv(''), []);
console.log('csv ok');
