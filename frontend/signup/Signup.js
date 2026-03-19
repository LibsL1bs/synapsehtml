 const form = document.getElementById('signupForm');
    const pwd = document.getElementById('pwd');
    const pwd2 = document.getElementById('pwd2');

    function passwordValid(p){
      return p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p);
    }

    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      if (pwd.value !== pwd2.value) { alert('As senhas não coincidem.'); return; }
      if (!passwordValid(pwd.value)) { alert('Senha não atende aos requisitos.'); return; }
      setTimeout(()=>{ alert('Conta criada! Bem-vindo ao Synapse.'); window.location.href='Chat.html'; }, 900);
    });