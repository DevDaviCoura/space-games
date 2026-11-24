
const busca = document.querySelector('#library-search');
const grade = document.querySelector('#library-grid');
const vazio = document.querySelector('#library-empty');
const aviso = document.querySelector('#library-notice');

let jogosBiblioteca = [];

async function carregarBiblioteca() {
    try {
        const resposta = await fetch('/api/biblioteca', {
            credentials: 'include'
        });

        if (!resposta.ok) {
            throw new Error('Não foi possível carregar a biblioteca.');
        }

        const registros = await resposta.json();

        jogosBiblioteca = registros.map(registro => registro.jogo);

        renderizar();

    } catch (erro) {
        console.error(erro);
        aviso.textContent = erro.message;
    }
}

function criarCard(jogo) {
    const card = document.createElement('article');
    card.className = 'library-card';

    const arte = document.createElement('div');
    arte.className = 'library-art arcade';

    if (jogo.imagem_url) {
        arte.style.backgroundImage = `url("${jogo.imagem_url}")`;
        arte.style.backgroundSize = 'cover';
        arte.style.backgroundPosition = 'center';
    }

    const sigla = document.createElement('strong');
    sigla.textContent = jogo.titulo.substring(0, 2).toUpperCase();

    if (!jogo.imagem_url) {
        arte.append(sigla);
    }

    const corpo = document.createElement('div');
    corpo.className = 'library-card-body';

    const titulo = document.createElement('h3');
    titulo.textContent = jogo.titulo;

    const categoria = document.createElement('p');
    categoria.textContent = `Jogo adquirido`;

    const rodape = document.createElement('div');
    rodape.className = 'library-card-bottom';

    const estado = document.createElement('span');
    estado.className = 'library-pill';
    estado.textContent = 'Na sua biblioteca';

    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'play-button';

    botao.textContent = jogo.jogavel ? '▶ Jogar' : 'Em breve';
    botao.disabled = !jogo.jogavel;

    if (jogo.jogavel) {
    botao.addEventListener('click', () => {
        window.location.href = '/tetris.html';
    });
}

    rodape.append(estado, botao);
    corpo.append(titulo, categoria, rodape);
    card.append(arte, corpo);

    return card;
}

function renderizar() {
    const termo = busca.value.trim().toLocaleLowerCase('pt-BR');

    const jogosFiltrados = jogosBiblioteca.filter(jogo =>
        jogo.titulo.toLocaleLowerCase('pt-BR').includes(termo)
    );

    grade.replaceChildren(...jogosFiltrados.map(criarCard));

    document.querySelector('#library-count').textContent =
        `(${jogosFiltrados.length})`;

    document.querySelector('#library-mode').textContent =
        'Biblioteca conectada à sua conta';

    vazio.hidden = jogosFiltrados.length > 0;

    document.querySelector('#empty-title').textContent =
        termo ? 'Nenhum jogo encontrado' : 'Sua biblioteca está vazia';

    document.querySelector('#empty-message').textContent =
        termo
            ? 'Tente buscar outro título.'
            : 'Seus jogos adquiridos aparecerão aqui.';

    aviso.textContent = '';
}

busca.addEventListener('input', renderizar);

// Menu/Sair

const loginLink = document.querySelector('#login-link');
const userMenuButton = document.querySelector('#user-menu-button');
const userName = document.querySelector('#user-name');
const userArrow = document.querySelector('#user-arrow');
const accountDropdown = document.querySelector('#account-dropdown');
const logoutButton = document.querySelector('#logout-button');

let usuarioLogado = false;

// Atualiza o menu conforme a sessão
function atualizarConta(usuario) {

    usuarioLogado = !!usuario;

    if (usuarioLogado) {

        loginLink.hidden = true;
        userMenuButton.hidden = false;

        userName.textContent = usuario.nome;

    } else {

        loginLink.hidden = false;
        userMenuButton.hidden = true;

        accountDropdown.hidden = true;
        userArrow.textContent = '⌄';
    }
}

// Verifica o usuário autenticado
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

// Abre e fecha o menu
userMenuButton?.addEventListener('click', () => {

    accountDropdown.hidden = !accountDropdown.hidden;

    userArrow.textContent =
        accountDropdown.hidden ? '⌄' : '⌃';

});

// Fecha ao clicar fora
document.addEventListener('click', (event) => {

    const accountMenu = document.querySelector('#account-menu');

    if (accountMenu && !accountMenu.contains(event.target)) {

        accountDropdown.hidden = true;
        userArrow.textContent = '⌄';

    }

});

// Fecha com ESC
document.addEventListener('keydown', (event) => {

    if (event.key === 'Escape') {

        accountDropdown.hidden = true;
        userArrow.textContent = '⌄';

    }

});

// Encerra a sessão
logoutButton?.addEventListener('click', async () => {

    try {

        logoutButton.disabled = true;

        const resposta = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (!resposta.ok) {
            throw new Error('Não foi possível sair da conta.');
        }

        atualizarConta(null);

        // Limpa os jogos exibidos na biblioteca
        jogosBiblioteca = [];
        renderizar();

        aviso.textContent = 'Você saiu da sua conta!';

    } catch (erro) {

        console.error('Erro ao sair:', erro);
        aviso.textContent = erro.message;

    } finally {

        logoutButton.disabled = false;

    }

});

// Verifica a sessão ao abrir a biblioteca
verificarLogin();

carregarBiblioteca();
