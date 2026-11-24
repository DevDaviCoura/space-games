
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

// Verifica se o e-mail tem um formato válido
const emailValido = (email) => {
  return typeof email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    email.length <= 150;
};

// Retorna apenas os dados públicos do usuário
const dadosUsuario = (usuario) => ({
  id: usuario.id,
  nome: usuario.nome,
  email: usuario.email,
  is_admin: usuario.is_admin
});

// Configuração do cookie de autenticação
const cookieConfig = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 86400000,
  path: '/'
};

// CADASTRO
exports.cadastrar = async (req, res, next) => {
  try {
    const { nome, email, senha } = req.body;

    // Valida os dados recebidos
    if (
      typeof nome !== 'string' ||
      nome.trim().length < 2 ||
      nome.length > 120 ||
      !emailValido(email) ||
      typeof senha !== 'string' ||
      senha.length < 8 ||
      senha.length > 72
    ) {
      return res.status(400).json({
        erro: 'Informe nome, e-mail e senha válida (8 a 72 caracteres)'
      });
    }

    const emailNormalizado = email.toLowerCase();

    // Verifica se o e-mail já está cadastrado
    const existente = await Usuario.findOne({
      where: { email: emailNormalizado }
    });

    if (existente) {
      return res.status(409).json({
        erro: 'E-mail já cadastrado'
      });
    }

    // Criptografa a senha e salva o usuário
    const senhaHash = await bcrypt.hash(senha, 12);

    const usuario = await Usuario.create({
      nome: nome.trim(),
      email: emailNormalizado,
      senha_hash: senhaHash,
      is_admin: false
    });

    res.status(201).json(dadosUsuario(usuario));
  } catch (erro) {
    next(erro);
  }
};

// LOGIN
exports.login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    if (!emailValido(email) || typeof senha !== 'string') {
      return res.status(400).json({
        erro: 'Credenciais inválidas'
      });
    }

    // Busca o usuário pelo e-mail
    const usuario = await Usuario.findOne({
      where: { email: email.toLowerCase() }
    });

    // Verifica a senha e se a conta está ativa
    if (
      !usuario ||
      !usuario.ativo ||
      !(await bcrypt.compare(senha, usuario.senha_hash))
    ) {
      return res.status(401).json({
        erro: 'E-mail ou senha inválidos'
      });
    }

    // Verifica a configuração do JWT
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      return res.status(500).json({
        erro: 'JWT_SECRET não configurado'
      });
    }

    // Gera o token de autenticação
    const token = jwt.sign(
      { id: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('sg_token', token, cookieConfig);
    res.json(dadosUsuario(usuario));
  } catch (erro) {
    next(erro);
  }
};

// LOGOUT
exports.logout = (req, res) => {
  res.clearCookie('sg_token', {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  res.json({ mensagem: 'Sessão encerrada' });
};

// CONSULTAR USUÁRIO LOGADO
exports.me = (req, res) => {
  res.json(dadosUsuario(req.usuario));
};
