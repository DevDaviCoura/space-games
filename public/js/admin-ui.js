const $ = (seletor) => document.querySelector(seletor);

let jogos = [];
let categorias = [];
let pedidos = [];
let usuarios = [];
let usuarioLogado = null;

const money = (valor) =>
  Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

function toast(mensagem) {
  const elemento = $('#admin-toast');
  elemento.textContent = mensagem;
  elemento.classList.add('show');

  clearTimeout(window.adminToastTimer);

  window.adminToastTimer = setTimeout(() => {
    elemento.classList.remove('show');
  }, 2500);
}

// Faz requisições para a API
async function api(url, options = {}) {
  const resposta = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (resposta.status === 204) {
    return null;
  }

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(dados.erro || 'Erro na operação.');
  }

  return dados;
}

async function iniciarAdmin() {
    try {
        usuarioLogado = await api('/api/auth/me');
        await carregarDados();
    } catch (erro) {
        toast('Não foi possível validar sua sessão.');
    }
}

iniciarAdmin();

// Carrega jogos e categorias do banco
async function carregarDados() {
  try {
    const [
      listaJogos,
      listaCategorias,
      listaPedidos,
      listaUsuarios
    ] = await Promise.all([
      api('/api/admin/jogos'),
      api('/api/categorias'),
      api('/api/admin/pedidos'),
      api('/api/admin/usuarios')
    ]);

    jogos = listaJogos;
    categorias = listaCategorias;
    pedidos = listaPedidos;
    usuarios = listaUsuarios;

    renderizarJogos();
    renderizarCategorias();
    renderizarPedidos();
    renderizarUsuarios();
    atualizarEstatisticas();

  } catch (erro) {
    toast(erro.message);
  }
}


// Atualiza os números do painel
function atualizarEstatisticas() {
  $('#stat-games').textContent =
    jogos.filter(jogo => jogo.ativo).length;

  $('#stat-categories').textContent =
    categorias.length;

  $('#stat-orders').textContent =
    pedidos.length;

  $('#stat-users').textContent =
    usuarios.length;
}

// Cria uma célula da tabela
function criarCelula(linha, valor) {
  const celula = document.createElement('td');
  celula.textContent = valor ?? '';
  linha.appendChild(celula);
  return celula;
}

// Exibe os jogos na tabela
function renderizarJogos() {
  const corpo = $('#games-body');
  corpo.replaceChildren();

  const pesquisa = $('#game-search').value
    .trim()
    .toLocaleLowerCase('pt-BR');

  const filtrados = jogos.filter(jogo =>
    jogo.titulo.toLocaleLowerCase('pt-BR').includes(pesquisa)
  );

  $('#games-empty').hidden = filtrados.length > 0;

  filtrados.forEach(jogo => {
    const linha = document.createElement('tr');

    criarCelula(linha, jogo.titulo);

    criarCelula(
      linha,
      jogo.categoria?.nome ||
      jogo.Categoria?.nome ||
      'Sem categoria'
    );

    criarCelula(linha, money(jogo.preco));

    const status = criarCelula(
      linha,
      jogo.ativo ? 'Ativo' : 'Inativo'
    );

    status.className = jogo.ativo
      ? 'status'
      : 'status off';

    const acoes = document.createElement('td');
    acoes.className = 'table-actions';

    const editar = document.createElement('button');
    editar.textContent = 'Editar';
    editar.addEventListener('click', () => abrirJogo(jogo));

    const alternar = document.createElement('button');
    alternar.textContent = jogo.ativo ? 'Desativar' : 'Ativar';

    alternar.addEventListener('click', () => alterarStatus(jogo));

    acoes.append(editar, alternar);
    linha.appendChild(acoes);
    corpo.appendChild(linha);
  });
}

// Carrega as categorias no formulário
function preencherCategorias() {
  const select = $('#game-category');
  const valorAtual = select.value;

  select.replaceChildren();

  categorias.forEach(categoria => {
    const opcao = document.createElement('option');
    opcao.value = categoria.id;
    opcao.textContent = categoria.nome;
    select.appendChild(opcao);
  });

  if ([...select.options].some(opcao => opcao.value === valorAtual)) {
    select.value = valorAtual;
  }
}

// Lista as categorias na aba
function renderizarCategorias() {
  const lista = $('#category-list');
  lista.replaceChildren();

  categorias.forEach(categoria => {
    const item = document.createElement('div');
    item.className = 'category-row';

    const nome = document.createElement('span');
    nome.textContent = categoria.nome;

    const editar = document.createElement('button');
    editar.textContent = 'Editar';

    editar.addEventListener('click', async () => {
      const novoNome = prompt(
        'Digite o novo nome da categoria:',
        categoria.nome
      );

      if (novoNome === null) return;

      if (novoNome.trim().length < 2) {
        return toast('O nome precisa ter pelo menos 2 caracteres.');
      }

      try {
        await api(`/api/categorias/${categoria.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            nome: novoNome.trim()
          })
        });

        toast('Categoria atualizada!');
        await carregarDados();

      } catch (erro) {
        toast(erro.message);
      }
    });

    const excluir = document.createElement('button');
    excluir.textContent = 'Excluir';

    excluir.addEventListener('click', async () => {
      if (!confirm(`Deseja excluir a categoria "${categoria.nome}"?`)) {
        return;
      }

      try {
        await api(`/api/categorias/${categoria.id}`, {
          method: 'DELETE'
        });

        toast('Categoria excluída!');
        await carregarDados();

      } catch (erro) {
        toast(erro.message);
      }
    });

    item.append(nome, editar, excluir);
    lista.appendChild(item);
  });

  preencherCategorias();
}

//Lista de pedidos
function renderizarPedidos() {
  const corpo = $('#orders-body');
  corpo.replaceChildren();

  pedidos.forEach(pedido => {
    const linha = document.createElement('tr');

    criarCelula(linha, `#${pedido.id}`);

    criarCelula(
      linha,
      pedido.usuario?.nome ||
      pedido.Usuario?.nome ||
      'Usuário não encontrado'
    );

    criarCelula(
      linha,
      pedido.jogo?.titulo ||
      pedido.Jogo?.titulo ||
      'Jogo não encontrado'
    );

    criarCelula(linha, money(pedido.valor_total));

    const status = criarCelula(
      linha,
      pedido.status
    );

    status.className = `status ${pedido.status}`;

    corpo.appendChild(linha);
  });
}

//Lista de usuarios
function renderizarUsuarios() {
  const corpo = $('#users-body');
  corpo.replaceChildren();

  usuarios.forEach(usuario => {
    const linha = document.createElement('tr');

    criarCelula(linha, usuario.nome);
    criarCelula(linha, usuario.email);

    const perfil = criarCelula(
      linha,
      usuario.is_admin ? 'Administrador' : 'Cliente'
    );

    perfil.className = usuario.is_admin
      ? 'status admin'
      : 'status';

    const acoes = document.createElement('td');
    acoes.className = 'table-actions';

    const botaoPerfil = document.createElement('button');

    botaoPerfil.textContent = usuario.is_admin
      ? 'Remover administrador'
      : 'Tornar administrador';

    // Evita alterar o próprio perfil
    if (usuario.id === usuarioLogado.id) {
      botaoPerfil.disabled = true;
    }

    botaoPerfil.addEventListener('click', async () => {
      const novoPerfil = !usuario.is_admin;

      const acao = novoPerfil
        ? 'tornar este usuário administrador'
        : 'remover a permissão de administrador deste usuário';

      if (!confirm(`Deseja ${acao}?`)) {
        return;
      }

      try {
        await api(`/api/admin/usuarios/${usuario.id}/perfil`, {
          method: 'PATCH',
          body: JSON.stringify({
            is_admin: novoPerfil
          })
        });

        toast(novoPerfil
          ? 'Usuário promovido a administrador!'
          : 'Permissão de administrador removida!'
        );

        await carregarDados();

      } catch (erro) {
        toast(erro.message);
      }
    });

    acoes.appendChild(botaoPerfil);
    linha.appendChild(acoes);
    corpo.appendChild(linha);
  });
}



// Abre o formulário para cadastrar ou editar
function abrirJogo(jogo = null) {
  $('#game-form').reset();

  $('#game-id').value = jogo?.id ?? '';
  $('#dialog-title').textContent = jogo ? 'Editar jogo' : 'Novo jogo';

  $('#game-title').value = jogo?.titulo ?? '';
  $('#game-description').value = jogo?.descricao ?? '';
  $('#game-price').value = jogo?.preco ?? '';
  $('#game-playable').checked = jogo?.jogavel ?? false;

  preencherCategorias();

  $('#game-category').value =
    jogo?.categoria_id ?? categorias[0]?.id ?? '';

  $('#game-dialog').showModal();
}

// Cadastra ou atualiza um jogo
$('#game-form').addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const id = $('#game-id').value;

  const jogo = jogos.find(item => String(item.id) === String(id));

  const dados = {
    titulo: $('#game-title').value.trim(),
    descricao: $('#game-description').value.trim(),
    categoria_id: Number($('#game-category').value),
    preco: Number($('#game-price').value),
    jogavel: $('#game-playable').checked,
    imagem_url: jogo?.imagem_url || null,
    ativo: jogo?.ativo ?? true
  };

  if (
    !dados.titulo ||
    !dados.categoria_id ||
    !Number.isFinite(dados.preco) ||
    dados.preco < 0
  ) {
    return toast('Confira os campos do formulário.');
  }

  try {
    if (id) {
      await api(`/api/jogos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados)
      });

      toast('Jogo atualizado com sucesso!');
    } else {
      await api('/api/jogos', {
        method: 'POST',
        body: JSON.stringify(dados)
      });

      toast('Jogo cadastrado com sucesso!');
    }

    $('#game-dialog').close();
    await carregarDados();
  } catch (erro) {
    toast(erro.message);
  }
});

// Desativa ou reativa um jogo
async function alterarStatus(jogo) {
  try {
    if (jogo.ativo) {
      await api(`/api/jogos/${jogo.id}`, {
        method: 'DELETE'
      });

      toast('Jogo desativado!');
    } else {
      await api(`/api/jogos/${jogo.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          titulo: jogo.titulo,
          descricao: jogo.descricao,
          categoria_id: jogo.categoria_id,
          preco: Number(jogo.preco),
          imagem_url: jogo.imagem_url,
          jogavel: jogo.jogavel,
          ativo: true
        })
      });

      toast('Jogo reativado!');
    }

    await carregarDados();
  } catch (erro) {
    toast(erro.message);
  }
}

// Navegação entre abas
const abas = {
  resumo: 'Visão geral',
  jogos: 'Jogos',
  categorias: 'Categorias',
  pedidos: 'Pedidos',
  usuarios: 'Usuários'
};

function trocarAba(aba) {
  if (!abas[aba]) return;

  document.querySelectorAll('.admin-panel').forEach(painel => {
    painel.hidden = painel.id !== `panel-${aba}`;
  });

  document.querySelectorAll('[data-tab]').forEach(botao => {
    botao.classList.toggle('active', botao.dataset.tab === aba);
  });

  $('#page-title').textContent = abas[aba];
}

document.querySelectorAll('[data-tab]').forEach(botao => {
  botao.addEventListener('click', () => trocarAba(botao.dataset.tab));
});

document.querySelectorAll('[data-go]').forEach(botao => {
  botao.addEventListener('click', () => trocarAba(botao.dataset.go));
});

// Botões do formulário
$('#new-game').addEventListener('click', () => abrirJogo());

$('#close-dialog').addEventListener('click', () => {
  $('#game-dialog').close();
});

$('#cancel-dialog').addEventListener('click', () => {
  $('#game-dialog').close();
});

// Pesquisa
$('#game-search').addEventListener('input', renderizarJogos);


// Cadastra uma nova categoria
$('#category-form').addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const nome = $('#category-name').value.trim();

  if (nome.length < 2) {
    return toast('Digite um nome válido.');
  }

  try {
    await api('/api/categorias', {
      method: 'POST',
      body: JSON.stringify({ nome })
    });

    $('#category-form').reset();

    toast('Categoria cadastrada com sucesso!');

    await carregarDados();

  } catch (erro) {
    toast(erro.message);
  }
});
