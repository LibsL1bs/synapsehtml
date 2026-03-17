const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const suggestionsEl = document.getElementById('suggestions');

const API_URL = 'http://192.168.1.20:8000/chat'; // FastAPI

const initialMessages = [
  {
    id: '1',
    role: 'assistant',
    content: 'Olá! Sou o Synapse, sua IA especializada em powerlifting. Como posso ajudar você hoje?',
    timestamp: new Date()
  }
];

let messages = [...initialMessages];

function renderMessages(){
  messagesEl.innerHTML = '';
  messages.forEach(m=>{
    const el = document.createElement('div');
    el.className = 'message ' + (m.role === 'user' ? 'user' : 'assistant');
    el.innerHTML = `
      <div class="bubble">
        ${m.content}
        <div class="ts">${new Date(m.timestamp).toLocaleTimeString()}</div>
      </div>
    `;
    messagesEl.appendChild(el);
  });
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addMessage(role, content){
  messages.push({
    id: Date.now().toString(),
    role,
    content,
    timestamp: new Date()
  });
  renderMessages();
}

async function enviarPergunta(texto){
  // mensagem "pensando..."
  addMessage('assistant', '⏳ Pensando...');

  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pergunta: texto })
    });

    const data = await resp.json();

    // remove "Pensando..."
    messages = messages.filter(m => m.content !== '⏳ Pensando...');

    addMessage('assistant', data.resposta || 'Não consegui gerar uma resposta.');

  } catch (err) {
    messages = messages.filter(m => m.content !== '⏳ Pensando...');
    addMessage('assistant', '❌ Erro ao se comunicar com a IA.');
    console.error(err);
  }
}

sendBtn.addEventListener('click', ()=>{
  const val = inputEl.value.trim();
  if(!val) return;

  addMessage('user', val);
  inputEl.value = '';

  enviarPergunta(val);//
});

// Enter para enviar
inputEl.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter'){
    sendBtn.click();
  }
});

// quick suggestions
['Analisar meu último treino','Sugerir próximo treino','Ver meu perfil anatômico'].forEach(s=>{
  const b = document.createElement('button');
  b.className = 'chip';
  b.textContent = s;
  b.onclick = ()=>{ inputEl.value = s; };
  suggestionsEl.appendChild(b);
});

renderMessages();
