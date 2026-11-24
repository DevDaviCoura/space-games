require('dotenv').config();
const db = require('../src/models');
(async () => {
 try {
  await db.sequelize.authenticate();
  console.log('Conexao MySQL: OK');
  const [rows] = await db.sequelize.query('SHOW TABLES');
  console.log('Tabelas encontradas:', rows.map(row => Object.values(row)[0]).join(', ') || '(nenhuma; execute npm run db:migrate)');
 } catch (error) { console.error('Erro de conexao MySQL:', error.message); process.exitCode = 1; }
 finally { await db.sequelize.close(); }
})();
