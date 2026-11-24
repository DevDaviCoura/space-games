require('dotenv').config(); const bcrypt = require('bcryptjs'); const { Usuario, sequelize } = require('../src/models');
(async () => {
    const email = process.env.ADMIN_EMAIL, senha = process.env.ADMIN_PASSWORD;
    if (!email || !senha || senha.length < 12) throw Error('Defina ADMIN_EMAIL e ADMIN_PASSWORD (mínimo 12 caracteres) no .env');
    await sequelize.authenticate();
    const [user, created] = await Usuario.findOrCreate({ where: { email: email.toLowerCase() }, defaults: { nome: 'Administrador', email: email.toLowerCase(), senha_hash: await bcrypt.hash(senha, 12), is_admin: true } });
    if (!created) console.log('E-mail já existe. Nenhuma permissão foi alterada.'); else console.log('Administrador criado:', user.email);
    await sequelize.close();
})().catch(e => { console.error(e.message); process.exit(1) });
