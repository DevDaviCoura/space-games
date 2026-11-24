
const router = require('express').Router();

// ==========================================
// MIDDLEWARES
// ==========================================

const { auth, admin } = require('../middleware/auth');

// ==========================================
// CONTROLLERS
// ==========================================

const authController = require('../controllers/authController');
const catalogoController = require('../controllers/catalogoController');
const compraController = require('../controllers/compraController');

// ==========================================
// AUTENTICAÇÃO
// ==========================================

// Cadastro de usuário
router.post('/auth/cadastro', authController.cadastrar);

// Login
router.post('/auth/login', authController.login);

// Logout
router.post('/auth/logout', authController.logout);

// Consultar usuário autenticado
router.get('/auth/me', auth, authController.me);

// ==========================================
// CATEGORIAS
// ==========================================

// Listar categorias
router.get('/categorias', catalogoController.listarCategorias);

// Criar categoria (admin)
router.post(
  '/categorias',
  auth,
  admin,
  catalogoController.criarCategoria
);

// Atualizar categoria (admin)
router.put(
  '/categorias/:id',
  auth,
  admin,
  catalogoController.atualizarCategoria
);

// Excluir categoria (admin)
router.delete(
  '/categorias/:id',
  auth,
  admin,
  catalogoController.excluirCategoria
);

// ==========================================
// JOGOS
// ==========================================

// Listar jogos disponíveis
router.get('/jogos', catalogoController.listarJogos);

// Buscar jogo por ID
router.get('/jogos/:id', catalogoController.buscarJogo);

// Listar todos os jogos (admin)
router.get(
  '/admin/jogos',
  auth,
  admin,
  catalogoController.listarTodosJogos
);

// Alterar o perfil de um usuário
router.patch(
  '/admin/usuarios/:id/perfil',
  auth,
  admin,
  compraController.alterarPerfilUsuario
);

// Cadastrar jogo (admin)
router.post(
  '/jogos',
  auth,
  admin,
  catalogoController.criarJogo
);

// Atualizar jogo (admin)
router.put(
  '/jogos/:id',
  auth,
  admin,
  catalogoController.atualizarJogo
);

// Excluir jogo (admin)
router.delete(
  '/jogos/:id',
  auth,
  admin,
  catalogoController.excluirJogo
);

// ==========================================
// PEDIDOS E COMPRAS
// ==========================================

// Criar pedido
router.post('/pedidos', auth, compraController.criarPedido);

// Consultar pedidos do usuário
router.get('/pedidos', auth, compraController.meusPedidos);

// Confirmar pagamento simulado
router.post(
  '/pedidos/:id/confirmar',
  auth,
  compraController.confirmar
);

// Cancelar pedido
router.patch(
  '/pedidos/:id/cancelar',
  auth,
  compraController.cancelar
);

// ==========================================
// BIBLIOTECA
// ==========================================

// Consultar jogos adquiridos
router.get(
  '/biblioteca',
  auth,
  compraController.minhaBiblioteca
);

// ==========================================
// ADMINISTRAÇÃO
// ==========================================

// Consultar todos os pedidos
router.get(
  '/admin/pedidos',
  auth,
  admin,
  compraController.todosPedidos
);

// Consultar usuários cadastrados
router.get(
  '/admin/usuarios',
  auth,
  admin,
  compraController.usuarios
);

// ==========================================
// EXPORTAÇÃO
// ==========================================

module.exports = router;
