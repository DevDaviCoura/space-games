
const {
  sequelize,
  Pedido,
  Pagamento,
  Biblioteca,
  Jogo,
  Usuario
} = require('../models');

// =====================================
// PEDIDOS
// =====================================

// Cria um pedido para comprar um jogo
exports.criarPedido = async (req, res, next) => {
  try {
    const jogoId = Number(req.body.jogo_id);

    if (!Number.isSafeInteger(jogoId) || jogoId <= 0) {
      return res.status(400).json({ erro: 'Jogo inválido' });
    }

    const jogo = await Jogo.findByPk(jogoId);

    if (!jogo || !jogo.ativo) {
      return res.status(404).json({ erro: 'Jogo indisponível' });
    }

    // Verifica se o usuário já comprou o jogo
    const jaPossui = await Biblioteca.findOne({
      where: {
        usuario_id: req.usuario.id,
        jogo_id: jogoId
      }
    });

    if (jaPossui) {
      return res.status(409).json({
        erro: 'Você já possui este jogo'
      });
    }

    const pedido = await Pedido.create({
      usuario_id: req.usuario.id,
      jogo_id: jogoId,
      valor_total: jogo.preco,
      status: 'pendente'
    });

    res.status(201).json(pedido);
  } catch (erro) {
    next(erro);
  }
};

// Lista os pedidos do usuário logado
exports.meusPedidos = async (req, res, next) => {
  try {
    const pedidos = await Pedido.findAll({
      where: { usuario_id: req.usuario.id },
      include: [Jogo, Pagamento],
      order: [['id', 'DESC']]
    });

    res.json(pedidos);
  } catch (erro) {
    next(erro);
  }
};

// =====================================
// PAGAMENTO SIMULADO
// =====================================

// Confirma o pagamento e libera o jogo
exports.confirmar = async (req, res, next) => {
  try {
    const resultado = await sequelize.transaction(async (t) => {
      const pedido = await Pedido.findByPk(req.params.id, {
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!pedido) {
        return { status: 404, erro: 'Pedido não encontrado' };
      }

      if (pedido.usuario_id !== req.usuario.id) {
        return { status: 403, erro: 'Pedido de outro usuário' };
      }

      if (pedido.status !== 'pendente') {
        return { status: 409, erro: 'Pedido não está pendente' };
      }

      // Impede liberar o mesmo jogo duas vezes
      const jaPossui = await Biblioteca.findOne({
        where: {
          usuario_id: pedido.usuario_id,
          jogo_id: pedido.jogo_id
        },
        transaction: t
      });

      if (jaPossui) {
        return { status: 409, erro: 'Jogo já adquirido' };
      }

      // Registra o pagamento fictício
      await Pagamento.create({
        pedido_id: pedido.id,
        tipo: 'simulado',
        status: 'aprovado',
        valor: pedido.valor_total,
        confirmado_em: new Date()
      }, { transaction: t });

      // Atualiza o pedido
      await pedido.update(
        { status: 'pago' },
        { transaction: t }
      );

      // Adiciona o jogo à biblioteca
      await Biblioteca.create({
        usuario_id: pedido.usuario_id,
        jogo_id: pedido.jogo_id,
        pedido_id: pedido.id
      }, { transaction: t });

      return {
        mensagem: 'Compra simulada confirmada',
        pedido_id: pedido.id
      };
    });

    if (resultado.erro) {
      return res.status(resultado.status).json({
        erro: resultado.erro
      });
    }

    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
};

// Cancela um pedido que ainda está pendente
exports.cancelar = async (req, res, next) => {
  try {
    const resultado = await sequelize.transaction(async (t) => {
      const pedido = await Pedido.findByPk(req.params.id, {
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!pedido) {
        return { status: 404, erro: 'Pedido não encontrado' };
      }

      if (pedido.usuario_id !== req.usuario.id) {
        return { status: 403, erro: 'Acesso negado' };
      }

      if (pedido.status !== 'pendente') {
        return { status: 409, erro: 'Pedido não pode ser cancelado' };
      }

      await pedido.update(
        { status: 'cancelado' },
        { transaction: t }
      );

      return { mensagem: 'Pedido cancelado' };
    });

    if (resultado.erro) {
      return res.status(resultado.status).json({
        erro: resultado.erro
      });
    }

    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
};

// =====================================
// BIBLIOTECA
// =====================================

// Lista os jogos comprados pelo usuário
exports.minhaBiblioteca = async (req, res, next) => {
  try {
    const biblioteca = await Biblioteca.findAll({
      where: { usuario_id: req.usuario.id },
      include: [Jogo],
      order: [['adquirido_em', 'DESC']]
    });

    res.json(biblioteca);
  } catch (erro) {
    next(erro);
  }
};

// =====================================
// ADMINISTRAÇÃO
// =====================================

// Lista todas as compras para o administrador
exports.todosPedidos = async (req, res, next) => {
  try {
    const pedidos = await Pedido.findAll({
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nome', 'email']
        },
        Jogo,
        Pagamento
      ],
      order: [['id', 'DESC']]
    });

    res.json(pedidos);
  } catch (erro) {
    next(erro);
  }
};

// Lista os usuários cadastrados


exports.usuarios = async (req, res, next) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: [
        'id',
        'nome',
        'email',
        'is_admin',
        'ativo',
        'criado_em'
      ],
      order: [['id', 'DESC']]
    });

    res.json(usuarios);
  } catch (erro) {
    next(erro);
  }
};


// Torna um usuário administrador ou remove sua permissão
exports.alterarPerfilUsuario = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { is_admin } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: 'ID de usuário inválido.'
      });
    }

    if (typeof is_admin !== 'boolean') {
      return res.status(400).json({
        erro: 'Informe um perfil válido.'
      });
    }

    // Impede que o administrador altere o próprio perfil
    if (id === req.usuario.id) {
      return res.status(403).json({
        erro: 'Você não pode alterar seu próprio perfil.'
      });
    }

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        erro: 'Usuário não encontrado.'
      });
    }

    // Impede remover o último administrador
    if (usuario.is_admin && !is_admin) {
      const totalAdmins = await Usuario.count({
        where: { is_admin: true }
      });

      if (totalAdmins <= 1) {
        return res.status(409).json({
          erro: 'Não é possível remover o último administrador.'
        });
      }
    }

    await usuario.update({ is_admin });

    res.json({
      mensagem: is_admin
        ? 'Usuário promovido a administrador.'
        : 'Permissão de administrador removida.',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        is_admin: usuario.is_admin
      }
    });

  } catch (erro) {
    next(erro);
  }
};

