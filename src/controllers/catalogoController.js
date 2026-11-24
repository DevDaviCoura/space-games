
const { Op } = require('sequelize');
const { Jogo, Categoria } = require('../models');

// =====================================
// CATEGORIAS
// =====================================

// Lista todas as categorias
exports.listarCategorias = async (req, res, next) => {
  try {
    const categorias = await Categoria.findAll({
      order: [['nome', 'ASC']]
    });

    res.json(categorias);
  } catch (erro) {
    next(erro);
  }
};

// Cadastra uma categoria
exports.criarCategoria = async (req, res, next) => {
  try {
    const { nome, descricao } = req.body;

    if (typeof nome !== 'string' || nome.trim().length < 2 || nome.length > 100) {
      return res.status(400).json({ erro: 'Nome inválido' });
    }

    const categoria = await Categoria.create({
      nome: nome.trim(),
      descricao: descricao || null
    });

    res.status(201).json(categoria);
  } catch (erro) {
    next(erro);
  }
};

// Atualiza uma categoria
exports.atualizarCategoria = async (req, res, next) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);

    if (!categoria) {
      return res.status(404).json({ erro: 'Categoria não encontrada' });
    }

    const { nome, descricao } = req.body;

    if (typeof nome !== 'string' || nome.trim().length < 2 || nome.length > 100) {
      return res.status(400).json({ erro: 'Nome inválido' });
    }

    await categoria.update({
      nome: nome.trim(),
      descricao: descricao || null
    });

    res.json(categoria);
  } catch (erro) {
    next(erro);
  }
};

// Exclui uma categoria sem jogos vinculados
exports.excluirCategoria = async (req, res, next) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);

    if (!categoria) {
      return res.status(404).json({ erro: 'Categoria não encontrada' });
    }

    const possuiJogos = await Jogo.count({
      where: { categoria_id: categoria.id }
    });

    if (possuiJogos > 0) {
      return res.status(409).json({ erro: 'Categoria possui jogos' });
    }

    await categoria.destroy();
    res.status(204).end();
  } catch (erro) {
    next(erro);
  }
};

// =====================================
// JOGOS
// =====================================

// Lista jogos ativos, com pesquisa e filtro
exports.listarJogos = async (req, res, next) => {
  try {
    const where = { ativo: true };

    if (req.query.q) {
      where.titulo = {
        [Op.like]: `%${String(req.query.q).slice(0, 100)}%`
      };
    }

    if (req.query.categoria_id) {
      const id = Number(req.query.categoria_id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: 'Categoria inválida' });
      }

      where.categoria_id = id;
    }

    const jogos = await Jogo.findAll({
      where,
      include: [{ model: Categoria, attributes: ['id', 'nome'] }],
      order: [['id', 'DESC']]
    });

    res.json(jogos);
  } catch (erro) {
    next(erro);
  }
};

// Lista todos os jogos para o administrador
exports.listarTodosJogos = async (req, res, next) => {
  try {
    const jogos = await Jogo.findAll({
      include: [Categoria],
      order: [['id', 'DESC']]
    });

    res.json(jogos);
  } catch (erro) {
    next(erro);
  }
};

// Busca um jogo pelo ID
exports.buscarJogo = async (req, res, next) => {
  try {
    const jogo = await Jogo.findByPk(req.params.id, {
      include: [Categoria]
    });

    if (!jogo || !jogo.ativo) {
      return res.status(404).json({ erro: 'Jogo não encontrado' });
    }

    res.json(jogo);
  } catch (erro) {
    next(erro);
  }
};

// Valida os dados necessários para cadastrar ou editar jogos
function validarJogo(dados) {
  return (
    typeof dados.titulo === 'string' &&
    dados.titulo.trim().length >= 2 &&
    dados.titulo.length <= 150 &&
    Number.isInteger(Number(dados.categoria_id)) &&
    Number(dados.categoria_id) > 0 &&
    dados.preco !== '' &&
    dados.preco !== null &&
    dados.preco !== undefined &&
    Number.isFinite(Number(dados.preco)) &&
    Number(dados.preco) >= 0 &&
    Number(dados.preco) <= 99999999.99 &&
    (!dados.imagem_url ||
      (typeof dados.imagem_url === 'string' && dados.imagem_url.length <= 500))
  );
}

// Cadastra um jogo
exports.criarJogo = async (req, res, next) => {
  try {
    const dados = req.body;

    if (!validarJogo(dados)) {
      return res.status(400).json({ erro: 'Dados do jogo inválidos' });
    }

    const categoria = await Categoria.findByPk(dados.categoria_id);

    if (!categoria) {
      return res.status(400).json({ erro: 'Categoria não existe' });
    }

    const jogo = await Jogo.create({
      titulo: dados.titulo.trim(),
      categoria_id: dados.categoria_id,
      descricao: dados.descricao || null,
      preco: dados.preco,
      imagem_url: dados.imagem_url || null,
      jogavel: dados.jogavel === true,
      ativo: dados.ativo !== false
    });

    res.status(201).json(jogo);
  } catch (erro) {
    next(erro);
  }
};

// Atualiza os dados de um jogo
exports.atualizarJogo = async (req, res, next) => {
  try {
    const jogo = await Jogo.findByPk(req.params.id);

    if (!jogo) {
      return res.status(404).json({ erro: 'Jogo não encontrado' });
    }

    const dados = req.body;

    if (!validarJogo(dados)) {
      return res.status(400).json({ erro: 'Dados do jogo inválidos' });
    }

    const categoria = await Categoria.findByPk(dados.categoria_id);

    if (!categoria) {
      return res.status(400).json({ erro: 'Categoria não existe' });
    }

    await jogo.update({
      titulo: dados.titulo.trim(),
      categoria_id: dados.categoria_id,
      descricao: dados.descricao || null,
      preco: dados.preco,
      imagem_url: dados.imagem_url || null,
      jogavel: dados.jogavel === true,
      ativo: dados.ativo !== false
    });

    res.json(jogo);
  } catch (erro) {
    next(erro);
  }
};

// Desativa um jogo sem apagar do banco
exports.excluirJogo = async (req, res, next) => {
  try {
    const jogo = await Jogo.findByPk(req.params.id);

    if (!jogo) {
      return res.status(404).json({ erro: 'Jogo não encontrado' });
    }

    await jogo.update({ ativo: false });

    res.json({ mensagem: 'Jogo desativado' });
  } catch (erro) {
    next(erro);
  }
};
