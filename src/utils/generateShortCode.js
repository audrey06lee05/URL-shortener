// generateShortCode.js — builds a random alphanumeric code (default 6
// characters) used as a candidate short_code. Purely random: no relation
// to the original URL — uniqueness is checked separately in urlService.js.
function generateShortCode(length = 6) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

module.exports = generateShortCode;
