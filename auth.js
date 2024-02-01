const fs = require('fs');

// Função para validar as credenciais do usuário
function validateUser(username, password) {
    const usersData = fs.readFileSync('./users.json');
    const users = JSON.parse(usersData);

    const user = users.find(u => u.username === username && u.password === password);

    return user;
}

module.exports = validateUser;
