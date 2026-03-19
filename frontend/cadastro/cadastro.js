btn.addEventListener("click", async () => {
  let nome = document.querySelector("#nome").value;
  let email = document.querySelector("#email").value;
  let senha = document.querySelector("#senha").value;
  const cadastrar = await fetch("http://192.168.1.30.8000", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome,
      email,
      senha,
    }),
  });
  if (cadastrar.status == 201) {
    alert("cadastrado com sucesso");
    return window.location.reload();
  }
  return alert("erro ao cadastrar");
});
