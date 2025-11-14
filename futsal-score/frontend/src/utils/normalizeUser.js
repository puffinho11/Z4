// Crie um novo arquivo: src/utils/normalizeUser.js
const normalizeUser = (u) => {
    if (!u) return null;
    return {
        ...u,
        // 1. GARANTE 'username' (para Sidebar e PerfilAtleta)
        username: u.username || u.nome || 'Usuário', 
        // 2. GARANTE 'nome' (para compatibilidade com a API)
        nome: u.nome || u.username || 'Usuário', 
        fotoUrl: u.fotoUrl || u.foto,
    };
};

export default normalizeUser;