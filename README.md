# SPACE GAMES

### Plataforma Web de Gerenciamento e Comercialização de Jogos Digitais

O Space Games é uma aplicação web desenvolvida para simular o funcionamento de uma loja de jogos digitais. A plataforma permite explorar um catálogo de jogos, realizar pedidos, gerenciar categorias e organizar os jogos adquiridos em uma biblioteca pessoal.

O projeto foi desenvolvido utilizando Node.js, Express, MySQL e Sequelize, aplicando conceitos de arquitetura MVC, desenvolvimento de APIs REST, autenticação e gerenciamento de dados.

## Tecnologias

| Tecnologia | Aplicação |
|---|---|
| Node.js | Ambiente de execução do backend |
| Express.js | Estruturação do servidor e rotas |
| JavaScript | Lógica da aplicação |
| HTML5 | Estrutura das páginas |
| CSS3 | Estilização e layout |
| MySQL | Banco de dados relacional |
| Sequelize | ORM e gerenciamento das entidades |
| Git | Controle de versão |

## Funcionalidades

### Usuários e autenticação
- Cadastro e login de usuários.
- Logout e gerenciamento de sessão.
- Controle de acesso conforme o perfil do usuário.
- Proteção de rotas administrativas.

### Catálogo de jogos
- Listagem e consulta de jogos.
- Cadastro de novos jogos.
- Edição e exclusão de registros.
- Organização por categorias.

### Pedidos e biblioteca
- Criação de pedidos.
- Confirmação e cancelamento de pedidos.
- Simulação de pagamentos.
- Biblioteca de jogos vinculada ao usuário.

### Administração
- Área administrativa.
- Gerenciamento de jogos.
- Gerenciamento de categorias.
- Controle de operações restritas.

## Arquitetura do projeto

A aplicação utiliza o padrão arquitetural MVC (Model-View-Controller), separando as responsabilidades para facilitar a manutenção e a organização do código.

- **Models:** representam as entidades e a estrutura de acesso aos dados.
- **Views:** apresentam a interface da aplicação.
- **Controllers:** processam as requisições e executam as regras de negócio.
- **Routes:** definem os endpoints disponíveis.
- **Middlewares:** realizam verificações de autenticação e autorização.

## Banco de dados

O projeto utiliza MySQL com Sequelize ORM para realizar o mapeamento objeto-relacional.

Principais entidades:
- Usuários
- Jogos
- Categorias
- Pedidos
- Pagamentos
- Biblioteca

A estrutura do banco é gerenciada por migrations, permitindo versionar alterações e manter o controle da evolução do esquema de dados.

## Execução local

**Pré-requisitos**
- Node.js
- MySQL
- npm

**Instalação**

1. Clone o repositório:

```bash
git clone URL_DO_REPOSITORIO
```

2. Acesse a pasta do projeto:

```bash
cd space-games
```

3. Instale as dependências:

```bash
npm install
```

4. Configure as variáveis de ambiente no arquivo `.env`, conforme as configurações utilizadas pela aplicação.

5. Crie o banco de dados MySQL e execute as migrations.

6. Inicie a aplicação utilizando o script configurado no `package.json`.

## Status

Projeto em desenvolvimento. As funcionalidades implementadas estão sendo aprimoradas e novas melhorias estão previstas.

## Objetivo

Aplicar conhecimentos de desenvolvimento de software, integração entre frontend e backend, modelagem de banco de dados, construção de APIs REST, autenticação e organização de aplicações utilizando arquitetura MVC.

---

Desenvolvido como projeto acadêmico de Análise e Desenvolvimento de Sistemas.