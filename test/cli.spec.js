const readMD = require('../md-links');

test('readMD', () => {
  expect.assertions(1)
  return readMD.then(readMD => {
    expect(readMD(path)).toBe('function');
  });
});