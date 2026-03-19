const form = document.getElementById('loginForm');
    const pwd = document.getElementById('password');
    const toggle = document.getElementById('togglePwd');
    const loading = document.getElementById('loading');

    toggle.addEventListener('click', ()=>{
      pwd.type = pwd.type === 'password' ? 'text' : 'password';
    });

    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      loading.style.display = 'inline-block';
      setTimeout(()=>{ loading.style.display = 'none'; alert('Login simulado — redirecionando'); window.location.href='Chat.html'; },900);
    });