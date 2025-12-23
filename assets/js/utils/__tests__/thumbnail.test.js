const { placeholderColor, placeholderText } = require('../thumbnail');

describe('placeholderColor', () => {
  test('returns a stable hsl color for the same seed', () => {
    const a = placeholderColor('user1');
    const b = placeholderColor('user1');
    expect(a).toBe(b);
    expect(a).toMatch(/^linear-gradient\(\d{1,3}deg, hsl\(\d{1,3}, 78%, 56%\), hsl\(\d{1,3}, 78%, 44%\)\)$/);
  });
});

describe('placeholderText', () => {
  test('returns first character uppercased', () => {
    expect(placeholderText('user1')).toBe('U');
  });

  test('returns ? for empty seed', () => {
    expect(placeholderText('')).toBe('?');
  });
});
