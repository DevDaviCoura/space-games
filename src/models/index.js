const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config')[process.env.NODE_ENV || 'development'];
const sequelize = new Sequelize(config.database, config.username, config.password, config);
const db = { sequelize, Sequelize };
const define = (name, fields, options = {}) => sequelize.define(name, fields, { tableName: name, timestamps: false, ...options });

db.Usuario = define('usuarios', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    senha_hash: { type: DataTypes.STRING(255), allowNull: false },
    is_admin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    criado_em: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
});
db.Categoria = define('categorias', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    descricao: DataTypes.TEXT
});
db.Jogo = define('jogos', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    categoria_id: { type: DataTypes.INTEGER, allowNull: false },
    titulo: { type: DataTypes.STRING(150), allowNull: false },
    descricao: DataTypes.TEXT,
    preco: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
    imagem_url: DataTypes.STRING(500),
    jogavel: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    criado_em: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
});
db.Pedido = define('pedidos', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    jogo_id: { type: DataTypes.INTEGER, allowNull: false },
    valor_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'pendente' },
    criado_em: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
});
db.Pagamento = define('pagamentos', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pedido_id: { type: DataTypes.INTEGER, allowNull: false },
    provedor_id: { type: DataTypes.STRING(150), unique: true },
    tipo: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'simulado' },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pendente' },
    valor: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    criado_em: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    confirmado_em: DataTypes.DATE
});
db.Biblioteca = define('biblioteca', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    jogo_id: { type: DataTypes.INTEGER, allowNull: false },
    pedido_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    adquirido_em: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, { indexes: [{ unique: true, fields: ['usuario_id', 'jogo_id'] }] });

db.Categoria.hasMany(db.Jogo, { foreignKey: 'categoria_id' }); db.Jogo.belongsTo(db.Categoria, { foreignKey: 'categoria_id' });
db.Usuario.hasMany(db.Pedido, { foreignKey: 'usuario_id' }); db.Pedido.belongsTo(db.Usuario, { foreignKey: 'usuario_id' });
db.Jogo.hasMany(db.Pedido, { foreignKey: 'jogo_id' }); db.Pedido.belongsTo(db.Jogo, { foreignKey: 'jogo_id' });
db.Pedido.hasMany(db.Pagamento, { foreignKey: 'pedido_id' }); db.Pagamento.belongsTo(db.Pedido, { foreignKey: 'pedido_id' });
db.Usuario.hasMany(db.Biblioteca, { foreignKey: 'usuario_id' }); db.Biblioteca.belongsTo(db.Usuario, { foreignKey: 'usuario_id' });
db.Jogo.hasMany(db.Biblioteca, { foreignKey: 'jogo_id' }); db.Biblioteca.belongsTo(db.Jogo, { foreignKey: 'jogo_id' });
db.Pedido.hasOne(db.Biblioteca, { foreignKey: 'pedido_id' }); db.Biblioteca.belongsTo(db.Pedido, { foreignKey: 'pedido_id' });
module.exports = db;
