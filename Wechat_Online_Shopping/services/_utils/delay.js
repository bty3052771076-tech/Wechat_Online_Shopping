function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { delay };
