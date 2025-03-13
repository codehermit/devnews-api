const bcrypt = require('bcryptjs');

async function generateHash() {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('admin123', salt);
  console.log('生成的哈希值:', hash);
}

generateHash();