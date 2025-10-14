// ======= Configurações =======
const API_URL = "http://localhost:4000/api"; // URL do backend
let token = null; // Armazenar token após login

// ======= Login =======
async function login(email, password) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
      token = data.token; // salva o token
      console.log("Login realizado:", data.user);
      alert("Login bem-sucedido!");
      listarTimes(); // listar times após login
    } else {
      console.error("Erro login:", data);
      alert("Erro no login: " + data.message);
    }
  } catch (err) {
    console.error(err);
  }
}

// ======= Listar Times =======
async function listarTimes() {
  try {
    const res = await fetch(`${API_URL}/teams`);
    const times = await res.json();

    const container = document.getElementById("listaTimes");
    container.innerHTML = ""; // limpa lista
    times.forEach(time => {
      const div = document.createElement("div");
      div.textContent = `${time.name} - Cor: ${time.colorPrimary}`;
      container.appendChild(div);
    });
  } catch (err) {
    console.error(err);
  }
}

// ======= Criar Novo Time =======
async function criarTime(nome, corPrimaria, corSecundaria, jogadores) {
  if (!token) return alert("Faça login primeiro!");

  try {
    const res = await fetch(`${API_URL}/teams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        name: nome,
        colorPrimary: corPrimaria,
        colorSecondary: corSecundaria,
        players: jogadores
      })
    });

    const data = await res.json();
    if (res.ok) {
      alert(`Time criado: ${data.name}`);
      listarTimes(); // atualiza lista
    } else {
      alert("Erro ao criar time: " + data.message);
      console.error(data);
    }
  } catch (err) {
    console.error(err);
  }
}

// ======= Exemplo de uso =======
// Você pode chamar essas funções a partir de botões na página

// login("teste@teste.com", "123456");
// criarTime("Time A", "#00FF00", "#FFFFFF", [{name: "Jogador 1", number: 1, position: "Goleiro"}]);
// listarTimes();
