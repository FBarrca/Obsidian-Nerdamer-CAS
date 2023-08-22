const SI_PREFIXES: { [key: string]: number } = {
  Q: 1e30,
  R: 1e27,
  Y: 1e24,
  Z: 1e21,
  E: 1e18,
  P: 1e15,
  T: 1e12,
  G: 1e9,
  M: 1e6,
  k: 1e3,
  "": 1,
  m: 1e-3,
  μ: 1e-6,
  u: 1e-6,
  n: 1e-9,
  p: 1e-12,
  f: 1e-15,
  a: 1e-18,
  z: 1e-21,
  y: 1e-24,
  r: 1e-27,
  q: 1e-30,
};

const PREFIX_REGEX = /(?<number>\d+(\.\d+)?)(?<prefix>[QRYZEPTGMkhdadcmuμnpfazyrq]{1,2})?/g;

/**
 * Multiplies the given number with its SI Prefix if available
 * @param numberStr String representation of the number
 * @param prefix SI prefix
 */
function multiplyWithPrefix(numberStr: string, prefix?: string): string {
  const number = parseFloat(numberStr);
  if (prefix && SI_PREFIXES[prefix] !== undefined) {
    return (number * SI_PREFIXES[prefix]).toString();
  }
  return numberStr;
}

export function multiplyBySiPrefix(s: string): string {
  const matches = [...s.matchAll(PREFIX_REGEX)];

  let result = s;
  for (const match of matches) {
    const groups = match.groups;
    if (!groups) continue;

    const replacedValue = multiplyWithPrefix(groups.number, groups.prefix);
    result = result.replace(match[0], replacedValue);
  }

  return result;
}

export function formatSI(value: number | string): string {
  if (typeof value === "string") {
    const numberPattern = /^[-+]?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?$/;
    if (!numberPattern.test(value)) return value;
    else value = Number(value);
  }
  // Handle zero separately
  if (value === 0) {
    return "0";
  }

  // Determine the sign of the number
  const sign = value < 0 ? "-" : "";
  value = Math.abs(value);

  for (const prefix in SI_PREFIXES) {
    const limit = SI_PREFIXES[prefix];
    if (value >= limit) {
      return sign + value / limit + prefix; // Return the number up to 2 decimal places with prefix
    }
  }

  return sign + value.toString(); // If the number is too small for any prefix
}
