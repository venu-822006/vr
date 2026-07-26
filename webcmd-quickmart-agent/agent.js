const { execSync } = require('node:child_process');

console.log('Initiating Webcmd agent flow...');

try {
  // 1. Run deterministic CLI adapter (Zero token burn on page navigation)
  console.log('Running quickmart checkout...');
  const rawOutput = execSync('npx webcmd quickmart checkout -f json');

  // 2. Parse structured JSON output
  const outputString = rawOutput.toString().trim();
  console.log('\nRaw Output from Webcmd:\n', outputString, '\n');

  // Try parsing the JSON
  let result;
  try {
      // In webcmd, the output might be wrapped in JSON arrays if multiple rows are returned.
      // -f json implies JSON output.
      const parsed = JSON.parse(outputString);
      result = Array.isArray(parsed) ? parsed[0] : parsed;
  } catch(e) {
      console.error('Error parsing JSON from webcmd output:', e.message);
      process.exit(1);
  }

  console.log(`Order Status: ${result.payment_status} | ID: ${result.order_id}`);
  console.log(`Item: ${result.item_title} | Price: ${result.price}`);
  console.log(`Delivery: ${result.delivery_eta} | Details: ${result.detail_url}`);
  
} catch (error) {
  console.error('Checkout agent failed:', error.message);
  if (error.stdout) console.log(error.stdout.toString());
  if (error.stderr) console.error(error.stderr.toString());
}
