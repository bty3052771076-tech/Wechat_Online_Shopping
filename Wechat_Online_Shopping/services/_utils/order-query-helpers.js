function parseGoodsRequestListParam(value) {
  if (!value || typeof value !== 'string') {
    return [];
  }

  const candidates = [value];

  try {
    const decoded = decodeURIComponent(value);
    if (decoded !== value) {
      candidates.unshift(decoded);
    }
  } catch (error) {
    // Keep the raw value as the only parsing candidate.
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      // Try the next candidate.
    }
  }

  return [];
}

module.exports = {
  parseGoodsRequestListParam,
};
