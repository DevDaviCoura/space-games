'use strict';
module.exports = {
 async up(queryInterface, Sequelize) {
  const { INTEGER, STRING, TEXT, BOOLEAN, DATE, DECIMAL } = Sequelize;
  const id = () => ({ type: INTEGER, primaryKey: true, autoIncrement: true });
  const fk = table => ({ type: INTEGER, allowNull: false, references: { model: table, key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' });
  const created = () => ({ type: DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') });
  await queryInterface.createTable('usuarios', { id: id(), nome: { type: STRING(120), allowNull: false }, email: { type: STRING(150), allowNull: false, unique: true }, senha_hash: { type: STRING(255), allowNull: false }, is_admin: { type: BOOLEAN, allowNull: false, defaultValue: false }, ativo: { type: BOOLEAN, allowNull: false, defaultValue: true }, criado_em: created() });
  await queryInterface.createTable('categorias', { id: id(), nome: { type: STRING(100), allowNull: false, unique: true }, descricao: TEXT });
  await queryInterface.createTable('jogos', { id: id(), categoria_id: fk('categorias'), titulo: { type: STRING(150), allowNull: false }, descricao: TEXT, preco: { type: DECIMAL(10,2), allowNull: false }, imagem_url: STRING(500), jogavel: { type: BOOLEAN, allowNull: false, defaultValue: false }, ativo: { type: BOOLEAN, allowNull: false, defaultValue: true }, criado_em: created() });
  await queryInterface.createTable('pedidos', { id: id(), usuario_id: fk('usuarios'), jogo_id: fk('jogos'), valor_total: { type: DECIMAL(10,2), allowNull: false }, status: { type: STRING(20), allowNull: false, defaultValue: 'pendente' }, criado_em: created() });
  await queryInterface.createTable('pagamentos', { id: id(), pedido_id: fk('pedidos'), provedor_id: { type: STRING(150), unique: true }, tipo: { type: STRING(20), allowNull: false, defaultValue: 'simulado' }, status: { type: STRING(30), allowNull: false, defaultValue: 'pendente' }, valor: { type: DECIMAL(10,2), allowNull: false }, criado_em: created(), confirmado_em: DATE });
  await queryInterface.createTable('biblioteca', { id: id(), usuario_id: fk('usuarios'), jogo_id: fk('jogos'), pedido_id: { ...fk('pedidos'), unique: true }, adquirido_em: created() });
  await queryInterface.addIndex('biblioteca', ['usuario_id', 'jogo_id'], { unique: true, name: 'biblioteca_usuario_jogo_unique' });
 },
 async down(queryInterface) {
  for (const name of ['biblioteca','pagamentos','pedidos','jogos','categorias','usuarios']) await queryInterface.dropTable(name);
 }
};
