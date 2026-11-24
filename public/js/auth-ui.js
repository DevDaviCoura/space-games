
'use strict';

// Identifica qual formulário está aberto
const form = document.querySelector('#login-form, #cadastro-form');

// Área onde serão exibidas mensagens
const message = document.querySelector('#form-message');

// Verifica se existe um formulário na página
if (form){
  form.addEventListener('submit', async (event) => {

    // Impede o recarregamento da página
    event.preventDefault();

    message.textContent = '';
    message.classList.remove('error');

    // Identifica se é cadastro ou login
    const cadastro = form.id === 'cadastro-form';

    // Guarda os dados digitados
    const email = form.querySelector('#email').value.trim();
    const senha = form.querySelector('#senha').value;

    let dados = {email, senha};


    // Se for cadastro, guarda também o nome
    if (cadastro){
      const nome = form.querySelector('#nome').value.trim();

      const confirmarSenha = form.querySelector('#confirmar-senha').value;

      if (senha !== confirmarSenha){
        message.textContent = 'Confirmar senha está incorreto.';
        message.classList.add('error');
        return;
      }

      dados.nome = nome;
    }

    try{

      // Define qual rota do backend será utilizada
      const rota = cadastro
      ? '/api/auth/cadastro'
      : '/api/auth/login';

      // Envia os dados para o servidor
      const resposta = await fetch(rota, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        credentials: 'include',

        body: JSON.stringify(dados)
      });

      // Converte a resposta para JSON
      const resultado = await resposta.json();

      // Verifica se ocorreu algum erro
      if(!resposta.ok){
        throw new Error(
          resultado.erro || 'Ocorreu um erro.'
        );
      }

      // Exibe mensagem de sucesso
      message.textContent = cadastro
      ? 'Cadastro realizado com sucesso!'
      : 'Login realizado com sucesso!';

      // Redireciona conforme o perfil do usuário
    setTimeout(() => {
  if (!cadastro && resultado.is_admin) {
    window.location.href = '/admin.html';
  } else {
    window.location.href = '/';
  }
}, 1000);
      

    } catch (erro){
      
      // Exibe o erro recebido do servidor
      message.textContent = erro.message;
      message.classList.add('erro');
    }
  });
}