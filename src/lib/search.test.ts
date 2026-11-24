import assert from 'node:assert/strict';
import { searchWords } from './search';

assert.deepEqual(searchWords('Summer Khaddar'), ['summer', 'khad']);
assert.deepEqual(searchWords('khadi khaddi khadar KHADDAR'), ['khad', 'khad', 'khad', 'khad']);
assert.deepEqual(searchWords('Mens Shawls'), ['men', 'shawl']);
assert.deepEqual(searchWords('wash & wear'), ['wash', 'wear']);
assert.deepEqual(searchWords('ASW-52'), ['asw', '52']);
assert.deepEqual(searchWords('100% boss_'), ['100', 'boss']);
assert.deepEqual(searchWords('   '), []);
console.log('search ok');
