
require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

const { auth, admin } = require('./src/middleware/auth');

// Configurações do Express
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Protege a página administrativa
app.get('/admin.html', auth, admin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Disponibiliza os arquivos HTML, CSS e JavaScript
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API
app.use('/api', require('./src/routes/api'));

// Página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Resposta para rotas da API que não existem
app.use('/api', (req, res) => {
  res.status(404).json({ erro: 'Endpoint não encontrado' });
});

// Tratamento de erros
app.use((erro, req, res, next) => {
  console.error(erro);

  if (erro.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ erro: 'Registro duplicado' });
  }

  if (erro.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(409).json({ erro: 'Registro possui vínculos' });
  }

  if (erro.name === 'SequelizeValidationError') {
    return res.status(400).json({ erro: 'Dados inválidos' });
  }

  res.status(500).json({ erro: 'Erro interno do servidor' });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`SPACE GAMES: http://localhost:${PORT}`);
});
