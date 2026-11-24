'use strict';

// Interações demonstrativas do front-end.
const searchInput = document.querySelector('#search-games');
const gameGrid = document.querySelector('#game-grid');
const cartCount = document.querySelector('#cart-count');
const toast = document.querySelector('#toast');
const noResults = document.querySelector('#no-results');

const CART_KEY = 'spacegames_cart_v1';

//Variaveis
let jogos = [];
let categoriaAtual = 'Todas';
let toastTimer;

//Carrinho
function getCart(){ 
  try {
     const items = JSON.parse(
      localStorage.getItem(CART_KEY) || '[]'
    ); 
    
    return Array.isArray(items) ? items : [];
   } catch { 
    return []; 
  } 
}
function saveCart(items) { 
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

 function updateCartCount(){
  if (cartCount){
    cartCount.textContent = getCart().length;
  }
}

updateCartCount();

//Notificação
function notify(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

//Carrega jogos do banco

async function carregarJogos() {
  try{
    const resposta = await fetch('/api/jogos');

    if (!resposta.ok){
      throw new Error('Erro ao buscar jogos no banco.');
    }
    jogos = await resposta.json();

    renderizarJogos();

  } catch (erro){ 
    console.error('Erro ao carregar jogos:', erro);

    if (noResults){
      noResults.textContent =
      'Não foi possível carregar os jogos. Tente novamente.';
      noResults.hidden = false;
    }
  }
}

//Renderizar jogos na tela
function renderizarJogos(){
  gameGrid.innerHTML = '';

  jogos.forEach(jogo => {
    const categoria = jogo.categoria?.nome || 'Sem categoria';

    const card = document.createElement('article');

    card.className = 'game-card';

    card.dataset.name = jogo.titulo.toLowerCase();
    card.dataset.category = categoria;

    //Area visual
    const art = document.createElement('div');

    art.className = 'game-art';

    //Se existir imagem cadastrada, usar
    if(jogo.imagem_url) {
      const imagem = document.createElement('img');

      imagem.src = jogo.imagem_url;
      imagem.alt = jogo.titulo;
      imagem.loading = 'lazy';

      imagem.style.width = '100%'
      imagem.style.height = '100%';
      imagem.style.objectFit = 'cover';

      imagem.onerror = () => imagem.remove();

      art.appendChild(imagem);

    } else {

      //Quando não tem imagem

      const iniciais = document.createElement('strong');

      iniciais.textContent = jogo.titulo
      .split(' ')
      .slice(0,2)
      .map(palavra => palavra[0])
      .join('')
      .toUpperCase();

      art.appendChild(iniciais);
    }

    //info do jogo
    const detalhes = document.createElement('div');

    detalhes.className = 'game-details';
    
    const informacoes = document.createElement('div');

    const titulo = document.createElement('h3');

    titulo.textContent = jogo.titulo;

    const categoriaTexto = document.createElement('span');

    categoriaTexto.className = 'game-category';
    categoriaTexto.textContent = categoria;

    informacoes.append(titulo, categoriaTexto);

    //Área de compra
    const compra = document.createElement('div');

    compra.className = 'game-purchase';

    const preco = document.createElement('span');

    preco.className = 'price';
    
    preco.textContent = Number(jogo.preco).toLocaleString(
      'pt-BR',
    {
      style: 'currency',
      currency: 'BRL'
    }
    );

    const botao = document.createElement('button');

    botao.className = 'add-cart';
    botao.type = 'button';
    botao.dataset.game = jogo.id;
    botao.textContent = '+'; 

    botao.setAttribute(
      'aria-label',
      `Adicionar ${jogo.titulo} ao carrinho`
    );

    compra.append(preco, botao);

    detalhes.append(informacoes, compra);

    card.append(art, detalhes);

    gameGrid.appendChild(card);
  });

  aplicarFiltro();
}

// Pesquisa e filtro
function aplicarFiltro(){
  const cards = document.querySelectorAll('.game-card');
  const termo = searchInput
  ? searchInput.value.trim().toLowerCase()
  : '';

  let visiveis = 0
  
  cards.forEach(card => {

    const nome = card.dataset.name || '';
    const categoria = card.dataset.category || '';

    const correspondeNome = nome.includes(termo);

    const correspondeCategoria =
    categoriaAtual === 'Todas' ||
    categoria.toLowerCase() === categoriaAtual.toLocaleLowerCase();

    const mostrar = correspondeNome && correspondeCategoria;

    card.hidden = !mostrar;

    if (mostrar){
      visiveis++;
    }

  });

  if (noResults){
    noResults.hidden = visiveis > 0;
  }
}

//Pesquisa nome
searchInput?.addEventListener('input', aplicarFiltro);

//Filtro categoria
document.querySelectorAll(
  '.category-link, .category-tile'
).forEach(link =>{

  link.addEventListener('click', () =>{

    categoriaAtual = link.dataset.category;

    aplicarFiltro();
  });
});

// Carrinho temporário salvo no navegador. Nicolas integrará os pedidos ao backend.

gameGrid.addEventListener('click', event =>{
  const button = event.target.closest('.add-cart');
  if (!button) return;
  
  const id = Number(button.dataset.game);

  const jogo = jogos.find(item => item.id === id);
  if (!jogo) return;

  const items = getCart();

  //Verifica se já está no carrinho
  if (items.some(item => item.id === id)){
    notify('Esse jogo já está no carrinho!');
    return; 
  }

  //Adiciona o jogo
  items.push({
    id: jogo.id,
    nome: jogo.titulo,
    categoria: jogo.categoria?.nome || 'Jogo digital',
    preco: Number(jogo.preco)
  });

  saveCart(items);
  
  updateCartCount();

  notify('Jogo adicionado ao carrinho');
});

// Menu para celular.
const mobileMenu = document.querySelector('#mobile-menu');
const topNav = document.querySelector('#top-nav');

mobileMenu?.addEventListener('click', () =>{
  topNav?.classList.toggle('open');
});

// Menu/Sair
const loginLink = document.querySelector('#login-link');
const userMenuButton = document.querySelector('#user-menu-button');
const userName = document.querySelector('#user-name');
const userArrow = document.querySelector('#user-arrow');
const accountDropdown = document.querySelector('#account-dropdown');
const logoutButton = document.querySelector('#logout-button');
const adminLink = document.querySelector('#admin-link');

let usuarioLogado = false;

// Atualiza o botão conforme o estado da conta
function atualizarConta(usuario) {

  usuarioLogado = !!usuario;

  if (usuarioLogado) {

    loginLink.hidden = true;
    userMenuButton.hidden = false;

    userName.textContent = usuario.nome;

    // Mostra o painel somente para administradores
    adminLink.hidden = !usuario.is_admin;

  } else {

    loginLink.hidden = false;
    userMenuButton.hidden = true;

    accountDropdown.hidden = true;
    userArrow.textContent = '⌄';

    // Esconde o painel quando não existe usuário logado
    adminLink.hidden = true;
  }
}

// Verifica se existe uma sessão ativa
async function verificarLogin() {

  try {

    const resposta = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include'
    });

    if (!resposta.ok) {
      atualizarConta(null);
      return;
    }

    const usuario = await resposta.json();

    atualizarConta(usuario);

  } catch (erro) {

    console.error('Erro ao verificar login:', erro);

    atualizarConta(null);
  }
}

// Abre e fecha o menu do usuário
userMenuButton?.addEventListener('click', () => {

  accountDropdown.hidden = !accountDropdown.hidden;

  userArrow.textContent = accountDropdown.hidden ? '⌄' : '⌃';

});

// Fecha o menu ao clicar fora dele
document.addEventListener('click', (event) => {

  const accountMenu = document.querySelector('#account-menu');

  if (accountMenu && !accountMenu.contains(event.target)) {

    accountDropdown.hidden = true;
    userArrow.textContent = '⌄';

  }

});

// Fecha o menu com ESC
document.addEventListener('keydown', (event) => {

  if (event.key === 'Escape') {

    accountDropdown.hidden = true;
    userArrow.textContent = '⌄';

  }

});

// Sair da conta
logoutButton?.addEventListener('click', async () => {

  try {

    logoutButton.disabled = true;

    const resposta = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });

    if (!resposta.ok) {
      throw new Error('Não foi possível encerrar a sessão.');
    }

    atualizarConta(null);

    notify('Você saiu da sua conta!');

  } catch (erro) {

    console.error('Erro ao sair:', erro);

    notify('Erro ao sair da conta.');

  } finally {

    logoutButton.disabled = false;

  }

});

// Verifica a conta ao carregar a página
verificarLogin();

//Inicialização
carregarJogos();