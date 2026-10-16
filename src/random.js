export function random01(seed, index) {
  let n = (seed ^ Math.imul(index + 1, 0x9e3779b9)) >>> 0;
  n = Math.imul(n ^ (n >>> 16), 0x21f0aaad); n = Math.imul(n ^ (n >>> 15), 0x735a2d97);
  return ((n ^ (n >>> 15)) >>> 0) / 4294967296;
}
export function freshSeed(previous, next = () => crypto.getRandomValues(new Uint32Array(1))[0]) {
  const candidate = next() % 9999 + 1;
  return candidate === previous ? candidate % 9999 + 1 : candidate;
}
