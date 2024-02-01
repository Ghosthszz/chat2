const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const session = require('express-session');
const validateUser = require('./auth');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secretpass', resave: true, saveUninitialized: true }));

// Rota de identificação
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

// Rota de identificação - processa dados do formulário
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Simula a validação do usuário e senha
    const user = validateUser(username, password);

    if (user) {
        req.session.user = user;
        res.redirect('/chat');
    } else {
        req.session.errorMessage = 'Usuário ou senha inválidos';
        res.redirect('/login');
    }
});

// Rota inicial - redireciona para a página de identificação
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Página inicial
app.get('/chat', (req, res) => {
    // Verifica se o usuário está autenticado
    if (req.session.user) {
        res.sendFile(__dirname + '/index.html');
    } else {
        res.redirect('/login');
    }
});

// Configuração do Socket.IO para comunicação em tempo real
io.on('connection', (socket) => {
    console.log('Um usuário conectado');

    // Evento para lidar com mensagens do chat
    socket.on('chat message', (msg) => {
        // Adiciona o nome do remetente à mensagem
        io.emit('chat message', { username: socket.username, message: msg });
    });

    // Evento quando um usuário se identifica
    socket.on('user joined', (username) => {
        socket.username = username;
        io.emit('chat message', { system: true, message: `${username} entrou no chat` });
    });

    // Evento quando um usuário se desconectar
    socket.on('disconnect', () => {
        if (socket.username) {
            io.emit('chat message', { system: true, message: `${socket.username} saiu do chat` });
        }
        console.log('Usuário desconectado');
    });
});

// Inicie o servidor
const port = 3000;
http.listen(port, () => {
    console.log(`Servidor está ouvindo na porta ${port}`);
});
