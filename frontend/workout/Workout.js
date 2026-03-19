 const exList = document.getElementById("exList");
            const addEx = document.getElementById("addEx");
            const startBtn = document.getElementById("startBtn");
            const finishBtn = document.getElementById("finishBtn");
            const timerEl = document.getElementById("timer");
            const noExerciseModal = document.getElementById("noExerciseModal");
            const closeModalBtn = document.getElementById("closeModalBtn");

            let exercises = [];

            let running = false;
            let seconds = 0;
            let timerId = null;

            const showNoExerciseModal = () => {
                noExerciseModal.classList.remove("hidden");
            };

            const hideNoExerciseModal = () => {
                noExerciseModal.classList.add("hidden");
            };

            closeModalBtn.addEventListener("click", hideNoExerciseModal);

            noExerciseModal.addEventListener("click", (event) => {
                if (event.target === noExerciseModal) {
                    hideNoExerciseModal();
                }
            });

            function formatTime(s) {
                const h = Math.floor(s / 3600);
                const m = Math.floor((s % 3600) / 60);
                const sec = s % 60;
                return [h, m, sec].map((x) => String(x).padStart(2, "0")).join(":");
            }

            function render() {
                exList.innerHTML = "";

                exercises.forEach((ex, i) => {
                    const el = document.createElement("div");
                    el.className = "exercise card";

                    el.innerHTML = `

<div class="exercise-header">

<strong>${i + 1}.</strong>

<input 
class="exercise-name"
value="${ex.name}"
oninput="changeName(${i}, this.value)"
>

<div>
<button onclick="toggleExpand(${i})">
${ex.expanded ? "Ocultar" : "Mostrar"}
</button>
</div>

</div>

<div class="sets ${ex.expanded ? "expanded" : "collapsed"}">

${ex.sets
.map(
    (s, idx) => `

<div class="set-row">

<div class="set-index">${idx + 1}</div>

<input class="small-input"
value="${s.weight}"
placeholder="kg"
oninput="changeWeight(${i},${idx},this.value)"
>

<input class="small-input"
value="${s.reps}"
placeholder="reps"
oninput="changeReps(${i},${idx},this.value)"
>

<button onclick="toggleComplete(${i},${idx})"
class="complete-btn">

${s.completed ? "✓" : "○"}

</button>

</div>

`
)
.join("")}

<div>

<button onclick="addSet(${i})" class="btn">
Adicionar Série
</button>

<button onclick="removeExercise(${i})"
class="btn remove-btn">
Remover
</button>

</div>

</div>

`;

                    exList.appendChild(el);
                });
            }

            window.changeName = (i, value) => {
                exercises[i].name = value;
            };

            window.changeWeight = (i, idx, value) => {
                exercises[i].sets[idx].weight = value;
            };

            window.changeReps = (i, idx, value) => {
                exercises[i].sets[idx].reps = value;
            };

            window.toggleExpand = (i) => {
                exercises[i].expanded = !exercises[i].expanded;
                render();
            };

            window.addSet = (i) => {
                exercises[i].sets.push({
                    weight: "",
                    reps: "",
                    completed: false,
                });
                render();
            };

            window.toggleComplete = (i, idx) => {
                exercises[i].sets[idx].completed = !exercises[i].sets[idx].completed;
                render();
            };

            window.removeExercise = (i) => {
                exercises.splice(i, 1);
                render();
            };

            addEx.addEventListener("click", () => {
                exercises.push({
                    name: "Novo Exercício",

                    sets: [{weight: "", reps: "", completed: false}],

                    expanded: true,
                });

                render();
            });

            startBtn.addEventListener("click", () => {
                if (running) return;

                if (exercises.length === 0) {
                    showNoExerciseModal();
                    return;
                }

                running = true;

                startBtn.style.display = "none";

                finishBtn.style.display = "inline-block";

                timerId = setInterval(() => {
                    seconds++;

                    timerEl.textContent = formatTime(seconds);
                }, 1000);
            });

            finishBtn.addEventListener("click", () => {
                if (!running) return;

                running = false;

                clearInterval(timerId);

                const duration = formatTime(seconds);

                let volume = 0;

                exercises.forEach((ex) => {
                    ex.sets.forEach((set) => {
                        const w = parseFloat(set.weight) || 0;

                        const r = parseFloat(set.reps) || 0;

                        volume += w * r;
                    });
                });

                const workout = {
                    date: new Date().toISOString(),

                    duration: duration,

                    exerciseNames: exercises.map((e) => e.name),

                    exercises: exercises.length,

                    volume: volume,
                };

                const history = JSON.parse(localStorage.getItem("workoutHistory")) || [];

                history.unshift(workout);

                localStorage.setItem(
                    "workoutHistory",

                    JSON.stringify(history)
                );

                alert("Treino salvo!");

                startBtn.style.display = "inline-block";

                finishBtn.style.display = "none";

                seconds = 0;

                timerEl.textContent = "00:00:00";
            });