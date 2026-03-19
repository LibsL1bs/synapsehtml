const loginform = document.querySelector('.loginForm');
const nomeinput = document.querySelector('#nome');
const emailinput = document.querySelector('#email');
const passwordinput = document.querySelector('#password');

loginform.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = nomeinput.value.trim();
    const email = emailinput.value.trim().toLowerCase();
    const senha = passwordinput.value.trim();

    if (!nome || !email || !senha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        const response = await fetch("http://192.168.1.30:8000/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, senha }),
        });

        if (response.status === 201) {
            alert("Cadastrado com sucesso!");
            window.location.reload();
        } else {
            const errorData = await response.json();
            alert(`Erro ao cadastrar: ${errorData.error}`);
        }
    } catch (error) {
        alert("Erro ao conectar com o servidor.");
    }
});