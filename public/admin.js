const passwordInput = document.getElementById('password');
const loginForm = document.getElementById('login-form');
const loginContainer = document.getElementById('login');
const messagesContainer = document.getElementById('messages-container');
const dashboard = document.getElementById('dashboard');
const errorMessage = document.getElementById('error');
const pendingContainer = document.getElementById('pending-container');
const correctPassword = 'admin123'; // Altere conforme necessário

// Verifica se já está logado
if (localStorage.getItem('loggedIn') === 'true') {
  loginContainer.classList.add('hidden');
  dashboard.classList.remove('hidden');
  loadMessages();
  loadPendingMessages();
}

loginForm.onsubmit = function (e) {
  e.preventDefault();
  const password = passwordInput.value;
  if (password === correctPassword) {
    localStorage.setItem('loggedIn', 'true'); // salva login
    loginContainer.classList.add('hidden');
    dashboard.classList.remove('hidden');
    loadMessages();
    loadPendingMessages();
  } else {
    errorMessage.classList.remove('hidden');
    setTimeout(() => errorMessage.classList.add('hidden'), 3000);
  }
};

async function loadMessages() {
  const res = await fetch('/api/messages/aprovadas');
  const msgs = await res.json();
  messagesContainer.innerHTML = '';
  msgs.forEach(msg => {
    const div = document.createElement('div');
    div.className = 'bg-card p-4 rounded-xl shadow border border-gray-700';
    div.innerHTML = `
      <p class="text-lg font-semibold">${msg.name}</p>
      <p class="text-gray-300 mt-2">${msg.phrase}</p>
    `;
    messagesContainer.appendChild(div);
  });
}

async function loadPendingMessages() {
  const res = await fetch('/api/messages/pendentes');
  const msgs = await res.json();
  pendingContainer.innerHTML = '';
  msgs.forEach(msg => {
    const div = document.createElement('div');
    div.className = 'bg-card p-4 rounded-xl shadow border border-gray-700';
    div.innerHTML = `
      <p class="text-lg font-semibold">${msg.name}</p>
      <p class="text-gray-300 mt-2 mb-4">${msg.phrase}</p>
      <div class="flex justify-end gap-2">
        <button onclick="aprovar(${msg.id})" class="bg-success hover:bg-emerald-700 text-white py-1 px-4 rounded-lg">Aprovar</button>
        <button onclick="rejeitar(${msg.id})" class="bg-danger hover:bg-red-700 text-white py-1 px-4 rounded-lg">Rejeitar</button>
      </div>
    `;
    pendingContainer.appendChild(div);
  });
}

async function aprovar(id) {
  await fetch(`/api/message/${id}/aprovar`, { method: 'POST' });
  loadPendingMessages();
  loadMessages();
}

async function rejeitar(id) {
  await fetch(`/api/message/${id}/rejeitar`, { method: 'POST' });
  loadPendingMessages();
}

const socket = new WebSocket(`wss://${window.location.host}`);
// Atualização do WebSocket
socket.onmessage = async function (event) {
  const data = JSON.parse(event.data);
  if (data.signal === 'nova_pendente') {
    const autoApproveEnabled = localStorage.getItem('autoApprove') === 'true';
    if (autoApproveEnabled) {
      // Busca a mensagem mais recente pendente e aprova
      const res = await fetch('/api/messages/pendentes');
      const msgs = await res.json();
      if (msgs.length > 0) {
        const msgMaisRecente = msgs[msgs.length - 1]; // ou 0 se quiser a mais nova no topo
        await aprovar(msgMaisRecente.id);
      }
    } else {
      loadPendingMessages();
    }
  }
};



const autoApproveToggle = document.getElementById('auto-approve-toggle');

// Verifica estado salvo do toggle
const autoApprove = localStorage.getItem('autoApprove') === 'true';
autoApproveToggle.checked = autoApprove;

// Salva mudança no toggle
autoApproveToggle.addEventListener('change', () => {
  localStorage.setItem('autoApprove', autoApproveToggle.checked);
});

