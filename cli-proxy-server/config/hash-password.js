#!/usr/bin/env node
// Dev helper: generate a bcrypt hash for a demo-account password.
// Usage: node cli-proxy-server/config/hash-password.js 'YourPassword'
// Then add `email:<hash>` to CLI_ACCOUNTS in your server .env (§3.3).
import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password) {
  console.error("Usage: node cli-proxy-server/config/hash-password.js '<password>'");
  process.exit(1);
}
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
