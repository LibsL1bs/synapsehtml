// Estado da aplicação
let currentPage = "dashboard";
let usuarios = [

];

// Funções utilitárias
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className =
    "toast " +
    (type === "error" ? "error" : type === "warning" ? "warning" : "");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function showModal(title, content) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").innerHTML = content;
  document.getElementById("modal").classList.add("active");
}

function closeModal() {
  document.getElementById("modal").classList.remove("active");
}

// Funções de ação
function viewUser(id) {
  const user = usuarios.find((u) => u.id === id);
  if (user) {
    const content = `
                    <p><strong>ID:</strong> ${user.id}</p>
                    <p><strong>Nome:</strong> ${user.nome}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Status:</strong> ${user.status}</p>
                    <p><strong>Treinos:</strong> ${user.treinos}</p>
                    <p><strong>Último acesso:</strong> ${user.data}</p>
                    <div style="display: flex; gap: 8px; margin-top: 16px;">
                        <button class="btn primary btn-small" onclick="editUser(${user.id})">Editar</button>
                        <button class="btn outline btn-small" onclick="blockUser(${user.id})">${user.status === "bloqueado" ? "Desbloquear" : "Bloquear"}</button>
                    </div>
                `;
    showModal("Detalhes do Usuário", content);
  }
}

function editUser(id) {
  const user = usuarios.find((u) => u.id === id);
  if (user) {
    const content = `
                    <form onsubmit="saveUser(event, ${user.id})">
                        <div class="form-group">
                            <label>Nome</label>
                            <input type="text" value="${user.nome}" id="edit-nome" required>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" value="${user.email}" id="edit-email" required>
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <select id="edit-status">
                                <option value="ativo" ${user.status === "ativo" ? "selected" : ""}>Ativo</option>
                                <option value="inativo" ${user.status === "inativo" ? "selected" : ""}>Inativo</option>
                                <option value="bloqueado" ${user.status === "bloqueado" ? "selected" : ""}>Bloqueado</option>
                            </select>
                        </div>
                        <div style="display: flex; gap: 8px; margin-top: 16px;">
                            <button type="submit" class="btn primary">Salvar</button>
                            <button type="button" class="btn outline" onclick="closeModal()">Cancelar</button>
                        </div>
                    </form>
                `;
    showModal("Editar Usuário", content);
  }
}

function saveUser(event, id) {
  event.preventDefault();
  const user = usuarios.find((u) => u.id === id);
  if (user) {
    user.nome = document.getElementById("edit-nome").value;
    user.email = document.getElementById("edit-email").value;
    user.status = document.getElementById("edit-status").value;

    closeModal();
    showToast("Usuário atualizado com sucesso!");
    renderPage(currentPage);
  }
}

function blockUser(id) {
  const user = usuarios.find((u) => u.id === id);
  if (user) {
    user.status = user.status === "bloqueado" ? "ativo" : "bloqueado";
    showToast(
      `Usuário ${user.status === "bloqueado" ? "bloqueado" : "desbloqueado"} com sucesso!`,
    );
    closeModal();
    renderPage(currentPage);
  }
}

function deleteUser(id) {
  if (confirm("Tem certeza que deseja excluir este usuário?")) {
    usuarios = usuarios.filter((u) => u.id !== id);
    showToast("Usuário excluído com sucesso!");
    renderPage(currentPage);
  }
}

// Renderização das páginas
function renderDashboard() {
  return `
                <!-- Top bar -->
                <div class="admin-topbar">
                    <h1 class="page-title">Visão Geral</h1>
                    <div class="admin-profile">
                        <span>Administrador</span>
                        <div class="admin-avatar">A</div>
                    </div>
                </div>

                <!-- Cards de estatísticas -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-label">Usuários Ativos</span>
                            <span class="stat-change">+12%</span>
                        </div>
                        <div class="stat-value">${usuarios.filter((u) => u.status === "ativo").length}</div>
                        <div class="stat-label">últimos 30 dias</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-label">Total de Usuários</span>
                            <span class="stat-change">+8%</span>
                        </div>
                        <div class="stat-value">${usuarios.length}</div>
                        <div class="stat-label">cadastrados</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-label">Treinos Registrados</span>
                            <span class="stat-change">+24%</span>
                        </div>
                        <div class="stat-value">8,247</div>
                        <div class="stat-label">esse mês</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-label">Anotações</span>
                            <span class="stat-change">+15%</span>
                        </div>
                        <div class="stat-value">3,621</div>
                        <div class="stat-label">processadas</div>
                    </div>
                </div>

                <!-- Tabela de usuários recentes -->
                <div class="table-container">
                    <div class="table-header">
                        <h3 class="table-title">Usuários Recentes</h3>
                        <div class="table-actions">
                            <button class="btn outline btn-small" onclick="changePage('usuarios')">Ver todos</button>
                            <button class="btn primary btn-small" onclick="exportData()">Exportar</button>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Usuário</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Treinos</th>
                                <th>Último Acesso</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${usuarios
                              .slice(0, 4)
                              .map(
                                (user) => `
                                <tr>
                                    <td>${user.nome}</td>
                                    <td>${user.email}</td>
                                    <td>
                                        <span class="status-indicator status-${user.status}"></span>
                                        ${user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                    </td>
                                    <td>${user.treinos}</td>
                                    <td>${user.data}</td>
                                    <td>
                                        <button class="action-btn" onclick="viewUser(${user.id})">👁️</button>
                                        <button class="action-btn" onclick="editUser(${user.id})">✏️</button>
                                        <button class="action-btn" onclick="blockUser(${user.id})">⚠️</button>
                                    </td>
                                </tr>
                            `,
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>

                <!-- Estatísticas de Treinos -->
                <div class="table-container">
                    <div class="table-header">
                        <h3 class="table-title">Estatísticas de Treinos</h3>
                        <span class="badge success">Atualizado</span>
                    </div>
                    <div style="padding: 16px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                            <span>Agachamento</span>
                            <span style="color: #d4d0e0; font-weight: 600;">3,421</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                            <span>Supino</span>
                            <span style="color: #d4d0e0; font-weight: 600;">2,893</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                            <span>Levantamento Terra</span>
                            <span style="color: #d4d0e0; font-weight: 600;">1,933</span>
                        </div>
                    </div>
                </div>
            `;
}

function renderUsuarios() {
  return `
                <div class="admin-topbar">
                    <h1 class="page-title">Gerenciar Usuários</h1>
                    <div class="admin-profile">
                        <span>Administrador</span>
                        <div class="admin-avatar">A</div>
                    </div>
                </div>

                <div class="table-container">
                    <div class="table-header">
                        <h3 class="table-title">Todos os Usuários</h3>
                        <div class="table-actions">
                            <button class="btn primary btn-small" onclick="exportData()">Exportar CSV</button>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Treinos</th>
                                <th>Último Acesso</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${usuarios
                              .map(
                                (user) => `
                                <tr>
                                    <td>#${user.id}</td>
                                    <td>${user.nome}</td>
                                    <td>${user.email}</td>
                                    <td>
                                        <span class="status-indicator status-${user.status}"></span>
                                        ${user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                    </td>
                                    <td>${user.treinos}</td>
                                    <td>${user.data}</td>
                                    <td>
                                        <button class="action-btn" onclick="viewUser(${user.id})">👁️</button>
                                        <button class="action-btn" onclick="editUser(${user.id})">✏️</button>
                                        <button class="action-btn" onclick="blockUser(${user.id})">⚠️</button>
                                        <button class="action-btn" onclick="deleteUser(${user.id})">🗑️</button>
                                    </td>
                                </tr>
                            `,
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
            `;
}

function renderConfiguracoes() {
  return `
                <div class="admin-topbar">
                    <h1 class="page-title">Configurações Gerais</h1>
                    <div class="admin-profile">
                        <span>Administrador</span>
                        <div class="admin-avatar">A</div>
                    </div>
                </div>

                <div class="table-container">
                    <h3 class="table-title" style="margin-bottom: 20px;">Configurações do Sistema</h3>
                    
                    <div style="padding: 16px;">
                        <div class="form-group">
                            <label>Nome do Sistema</label>
                            <input type="text" value="Synapse Admin" readonly>
                        </div>
                        
                        <div class="form-group">
                            <label>Versão</label>
                            <input type="text" value="2.0.0" readonly>
                        </div>
                        
                        <div class="form-group">
                            <label>Idioma</label>
                            <select>
                                <option>Português (Brasil)</option>
                                <option>Inglês</option>
                                <option>Espanhol</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Fuso Horário</label>
                            <select>
                                <option>America/Sao_Paulo (GMT-3)</option>
                                <option>America/Manaus (GMT-4)</option>
                                <option>America/Noronha (GMT-2)</option>
                            </select>
                        </div>
                        
                        <button class="btn primary" onclick="showToast('Configurações salvas com sucesso!')">Salvar Alterações</button>
                    </div>
                </div>
            `;
}

function renderPermissoes() {
  return `
                <div class="admin-topbar">
                    <h1 class="page-title">Permissões</h1>
                    <div class="admin-profile">
                        <span>Administrador</span>
                        <div class="admin-avatar">A</div>
                    </div>
                </div>

                <div class="table-container">
                    <div class="table-header">
                        <h3 class="table-title">Níveis de Acesso</h3>
                        <button class="btn primary btn-small" onclick="showToast('Nova permissão criada!')">+ Novo Nível</button>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Nível</th>
                                <th>Usuários</th>
                                <th>Permissões</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Administrador</td>
                                <td>3</td>
                                <td>Acesso total</td>
                                <td><button class="action-btn">✏️</button></td>
                            </tr>
                            <tr>
                                <td>Moderador</td>
                                <td>5</td>
                                <td>Gerenciar usuários, ver relatórios</td>
                                <td><button class="action-btn">✏️</button></td>
                            </tr>
                            <tr>
                                <td>Visualizador</td>
                                <td>12</td>
                                <td>Apenas visualização</td>
                                <td><button class="action-btn">✏️</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
}

function renderPage(page) {
  const content = document.getElementById("mainContent");
  let html = "";

  switch (page) {
    case "dashboard":
      html = renderDashboard();
      break;
    case "usuarios":
      html = renderUsuarios();
      break;
    case "configuracoes":
      html = renderConfiguracoes();
      break;
    case "permissoes":
      html = renderPermissoes();
      break;
    default:
      html = renderDashboard();
  }

  content.innerHTML = html;

  // Atualizar active state na sidebar
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
    if (item.dataset.page === page) {
      item.classList.add("active");
    }
  });
}

function changePage(page) {
  currentPage = page;
  renderPage(page);
}

// Funções de exportação
function exportData() {
  showToast("Exportando dados...", "warning");
  setTimeout(() => {
    showToast("Dados exportados com sucesso!");
  }, 1500);
}

document.addEventListener("DOMContentLoaded", () => {
  renderPage("dashboard");

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      const page = e.currentTarget.dataset.page;
      changePage(page);
    });
  });
});
window.onclick = function (event) {
  const modal = document.getElementById("modal");
  if (event.target === modal) {
    closeModal();
  }
};
