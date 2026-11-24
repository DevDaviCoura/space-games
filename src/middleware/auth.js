
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

// Verifica se o usuário está autenticado
async function auth(req, res, next) {
  try {
    const token = req.cookies?.sg_token;

    if (!token || !process.env.JWT_SECRET) {
      return res.status(401).json({
        erro: 'Faça login'
      });
    }

    // Verifica se o token JWT é válido
    const dados = jwt.verify(token, process.env.JWT_SECRET);

    // Busca o usuário no banco
    const usuario = await Usuario.findByPk(dados.id);

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({
        erro: 'Sessão inválida'
      });
    }

    // Disponibiliza o usuário para as próximas funções
    req.usuario = usuario;

    next();
  } catch (erro) {
    return res.status(401).json({
      erro: 'Sessão inválida ou expirada'
    });
  }
}

// Permite acesso somente ao administrador
function admin(req, res, next) {
    if (!req.usuario || !req.usuario.is_admin) {
        return res.status(403).json({
            erro: 'Acesso restrito'
        });
    }

    next();
}

module.exports = { auth, admin };
