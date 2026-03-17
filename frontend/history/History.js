document.addEventListener("DOMContentLoaded", () => {
  const historyList = document.getElementById("historyList");
  const statTreinos = document.getElementById("statTreinos");
  const statVolume = document.getElementById("statVolume");
  const statDuracao = document.getElementById("statDuracao");

  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modalContent");
  const closeModal = document.getElementById("closeModal");

  const history = JSON.parse(localStorage.getItem("workoutHistory")) || [];

  historyList.innerHTML = "";

  let totalTreinos = history.length;
  let totalVolume = 0;
  let totalTempo = 0;

  history.forEach((workout, index) => {
    const names = workout.exerciseNames
      ? workout.exerciseNames.join(", ")
      : "Treino";

    const item = document.createElement("div");
    item.className = "item";

    item.innerHTML = `
<div>

<div class="meta">
${formatDate(workout.date)}
</div>

<div style="font-weight:600">
${names}
</div>

<div class="meta">
${workout.duration} • 
${workout.exercises} exercícios • 
${(workout.volume / 1000).toFixed(1)}t
</div>

</div>

<div>
<a href="#" onclick="openWorkout(${index})">Ver</a>
</div>
`;

    historyList.appendChild(item);

    totalVolume += workout.volume || 0;
    totalTempo += timeToSeconds(workout.duration || "00:00:00");
  });

  updateStats(totalTreinos, totalVolume, totalTempo);

  function updateStats(treinos, volume, tempo) {
    statTreinos.textContent = treinos;
    statVolume.textContent = (volume / 1000).toFixed(1) + "t";

    if (treinos === 0) {
      statDuracao.textContent = "00:00:00";
      return;
    }

    const media = Math.floor(tempo / treinos);

    statDuracao.textContent = formatTime(media);
  }

  function timeToSeconds(time) {
    const parts = time.split(":");

    const h = parseInt(parts[0]) || 0;
    const m = parseInt(parts[1]) || 0;
    const s = parseInt(parts[2]) || 0;

    return h * 3600 + m * 60 + s;
  }

  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  }

  function formatDate(date) {
    const d = new Date(date);

    return d.toLocaleDateString("pt-BR");
  }

  window.openWorkout = function (index) {
    const workout = history[index];

    modalContent.innerHTML = `

<p><strong>Data:</strong> ${formatDate(workout.date)}</p>

<p><strong>Duração:</strong> ${workout.duration}</p>

<p><strong>Exercícios:</strong> ${workout.exerciseNames.join(", ")}</p>

<p><strong>Total de exercícios:</strong> ${workout.exercises}</p>

<p><strong>Volume total:</strong> ${(workout.volume / 1000).toFixed(1)} kg</p>

`;

    modal.classList.remove("hidden");
  };

  closeModal.onclick = () => {
    modal.classList.add("hidden");
  };

  window.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  };
});
