/**
 * Generate a random unique 10-digit bank account number
 */
function generateAccountNumber() {
  // Starts with '10' followed by 8 random digits
  const randomDigits = Math.floor(10000000 + Math.random() * 90000000).toString();
  return `10${randomDigits}`;
}

module.exports = { generateAccountNumber };

