
const CART_KEY = 'spacegames_cart_v1';

const money = value =>
    Number(value).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

// Recupera os jogos do carrinho
function getCart() {
    try {
        const items = JSON.parse(
            localStorage.getItem(CART_KEY) || '[]'
        );

        return Array.isArray(items) ? items : [];
    } catch {
        return [];
    }
}

// Salva os jogos
function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
}

// Renderiza carrinho e checkout
function renderCart() {
    const items = getCart();

    const isCheckout = !!document.querySelector('#checkout-list');

    const list = document.querySelector(
        isCheckout ? '#checkout-list' : '#cart-list'
    );

    if (!list) return;

    list.replaceChildren();

    items.forEach(item => {
        const row = document.createElement('article');
        row.className = 'cart-item';

        const info = document.createElement('div');

        const title = document.createElement('h3');
        title.textContent = item.nome;

        const category = document.createElement('p');
        category.textContent = item.categoria || 'Jogo digital';

        info.append(title, category);

        const right = document.createElement('div');
        right.className = 'cart-right';

        const price = document.createElement('strong');
        price.textContent = money(item.preco);

        right.append(price);

        if (!isCheckout) {
            const remove = document.createElement('button');

            remove.className = 'remove';
            remove.type = 'button';
            remove.textContent = 'Remover';

            remove.addEventListener('click', () => {
                saveCart(
                    getCart().filter(jogo => jogo.id !== item.id)
                );

                renderCart();
            });

            right.append(remove);
        }

        row.append(info, right);
        list.append(row);
    });

    document.querySelector('#item-count').textContent =
        items.length;

    const total = items.reduce(
        (soma, item) => soma + item.preco,
        0
    );

    document.querySelector('#total').textContent = money(total);

    document.querySelector(
        isCheckout ? '#checkout-empty' : '#cart-empty'
    ).hidden = items.length > 0;

    const action = document.querySelector(
        isCheckout ? '#confirm-order' : '#checkout-link'
    );

    if (isCheckout) {
        action.disabled = items.length === 0;
    } else {
        action.classList.toggle('disabled', items.length === 0);

        action.setAttribute(
            'aria-disabled',
            String(items.length === 0)
        );
    }
}

// Lê a resposta da API
async function lerResposta(resposta) {
    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(dados.erro || 'Erro na operação.');
    }

    return dados;
}

// Realiza a compra simulada
async function finalizarCompra() {
    const botao = document.querySelector('#confirm-order');
    const mensagem = document.querySelector('#checkout-message');

    const items = getCart();

    if (items.length === 0) return;

    botao.disabled = true;
    botao.textContent = 'Processando...';

    let comprados = 0;

    try {
        for (const jogo of items) {

            // 1. Criar pedido
            const respostaPedido = await fetch('/api/pedidos', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    jogo_id: jogo.id
                })
            });

            const pedido = await lerResposta(respostaPedido);

            // 2. Confirmar pagamento simulado
            const respostaPagamento = await fetch(
                `/api/pedidos/${pedido.id}/confirmar`,
                {
                    method: 'POST',
                    credentials: 'include'
                }
            );

            await lerResposta(respostaPagamento);

            // 3. Remover jogo comprado do carrinho
            const restantes = getCart().filter(
                item => item.id !== jogo.id
            );

            saveCart(restantes);

            comprados++;
        }

        mensagem.textContent =
            'Compra realizada com sucesso! Seus jogos estão na biblioteca.';

        renderCart();

    } catch (erro) {
        console.error('Erro na compra:', erro);

        mensagem.textContent =
            `${erro.message} ${comprados > 0
                ? `${comprados} jogo(s) foram comprados com sucesso.`
                : 'Nenhum jogo adicional foi confirmado.'}`;

        renderCart();

    } finally {
        botao.disabled = getCart().length === 0;
        botao.textContent = 'Confirmar pedido';
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {

    renderCart();

    document.querySelector('#confirm-order')
        ?.addEventListener('click', finalizarCompra);

});
