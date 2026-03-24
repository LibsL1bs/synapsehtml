import express from "express";
import sql from "./database.js";
import { issueAccessSession } from "./authSession.js";
import requireAdminAuth from "./middlewares/requireAdminAuth.js";
import requireAuth from "./middlewares/requireAuth.js";
import { carregarDashboardEstado } from "./middlewares/load_state.js";
import { edit_memory } from "./middlewares/memory_tree.js";
import { executar_com_usuario } from "./chatbotv3.js";

const routes = express.Router();

const MEMORY_TYPES = ["perfil", "dados", "estado", "interpretado"];

const MEMORY_CONTENT_TEMPLATE = {
  perfil: {
    objetivo: "",
    experiencia_anos: 0,
    categoria_peso: "",
    observacoes: "",
  },
  dados: {
    peso_kg: 0,
    altura_cm: 0,
    idade: 0,
    sexo: "",
    lesoes: "",
  },
  estado: {
    readiness: 0,
    fadiga: 0,
    humor: "",
    sono_horas: 0,
  },
  interpretado: {
    resumo: "",
    pontos_chave: "",
    recomendacao: "",
    prioridade: "",
  },
};

let cachedMemoryTable = null;

function parseMemoryDate(inputDate) {
  if (!inputDate) return new Date();
  const parsed = new Date(String(inputDate));
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function normalizeMemoryType(tipo) {
  return String(tipo || "").trim().toLowerCase();
}

function castTemplateValue(value, expectedValue, keyName) {
  const expectedType = typeof expectedValue;
  if (expectedType === "number") {
    const normalized =
      typeof value === "string" ? value.trim().replace(",", ".") : value;
    const numberValue = Number(normalized);
    if (!Number.isFinite(numberValue)) {
      throw new Error(`Campo '${keyName}' deve ser numérico.`);
    }
    return numberValue;
  }

  if (expectedType === "boolean") {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const lowered = value.trim().toLowerCase();
      if (lowered === "true") return true;
      if (lowered === "false") return false;
    }
    throw new Error(`Campo '${keyName}' deve ser booleano.`);
  }

  if (expectedType === "string") {
    return String(value ?? "");
  }

  return value;
}

function validateMemoryPayload({ nome, tipo, conteudo, data }) {
  const cleanName = String(nome || "").trim();
  if (!cleanName) {
    throw new Error("Campo 'nome' é obrigatório.");
  }

  if (cleanName.length > 20) {
    throw new Error("Campo 'nome' deve ter no máximo 20 caracteres.");
  }

  const normalizedType = normalizeMemoryType(tipo);
  if (!MEMORY_TYPES.includes(normalizedType)) {
    throw new Error("Campo 'tipo' inválido. Use: perfil, dados, estado ou interpretado.");
  }

  if (!conteudo || typeof conteudo !== "object" || Array.isArray(conteudo)) {
    throw new Error("Campo 'conteudo' deve ser um objeto JSON.");
  }

  const template = MEMORY_CONTENT_TEMPLATE[normalizedType];
  const contentKeys = Object.keys(conteudo);
  const templateKeys = Object.keys(template);

  if (contentKeys.length !== templateKeys.length) {
    throw new Error("Conteúdo inválido para o tipo selecionado.");
  }

  for (const key of contentKeys) {
    if (!templateKeys.includes(key)) {
      throw new Error(`Campo '${key}' não é permitido para o tipo '${normalizedType}'.`);
    }
  }

  const normalizedContent = {};
  for (const key of templateKeys) {
    if (!(key in conteudo)) {
      throw new Error(`Campo '${key}' é obrigatório no conteúdo.`);
    }
    normalizedContent[key] = castTemplateValue(conteudo[key], template[key], key);
  }

  const parsedDate = parseMemoryDate(data);
  if (!parsedDate) {
    throw new Error("Campo 'data' inválido.");
  }

  return {
    nome: cleanName,
    tipo: normalizedType,
    conteudo: normalizedContent,
    data: parsedDate,
  };
}

async function resolveMemoryTable() {
  if (cachedMemoryTable) return cachedMemoryTable;

  const rows = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('memoria', 'memorias')
    ORDER BY CASE WHEN table_name = 'memoria' THEN 0 ELSE 1 END
    LIMIT 1
  `;

  if (!rows[0]?.table_name) {
    throw new Error("Tabela de memórias não encontrada.");
  }

  cachedMemoryTable = rows[0].table_name;
  return cachedMemoryTable;
}

//===================================================================================================
//------------------------------------ USUARIOS - ADMIN ---------------------------------------------
//===================================================================================================

routes.get("/users", requireAdminAuth, async (_req, res) => {
  try {
    const rows =
      await sql`SELECT id_user, nome, email, role_user, ativo FROM users ORDER BY id_user ASC`;
    return res.status(200).json({
      users: rows.map((row) => ({
        id_user: Number(row.id_user),
        nome: row.nome,
        email: row.email,
        role: row.role_user === "admin" ? "admin" : "user",
        role_id: row.role_user === "admin" ? 1 : 2,
        ativo: Boolean(row.ativo),
      })),
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

//---------------------------------------------------------------------------------------------------

routes.get("/users/:id", requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const rows =
      await sql`SELECT id_user, nome, email, role_user, ativo FROM users WHERE id_user = ${id}`;
    if (rows.length === 0)
      return res.status(404).json({ error: "Usuário não encontrado" });
    const row = rows[0];
    return res.status(200).json({
      user: {
        id_user: Number(row.id_user),
        nome: row.nome,
        email: row.email,
        role: row.role_user === "admin" ? "admin" : "user",
        role_id: row.role_user === "admin" ? 1 : 2,
        ativo: Boolean(row.ativo),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

//---------------------------------------------------------------------------------------------------

routes.post("/users", requireAdminAuth, async (req, res) => {
  try {
    const nome = String(req.body?.nome ?? req.body?.name ?? "").trim();
    const email = String(req.body?.email ?? "")
      .trim()
      .toLowerCase();
    const senha = String(req.body?.senha ?? req.body?.password ?? "").trim();
    const roleUser =
      String(req.body?.role_user ?? "user").toLowerCase() === "admin"
        ? "admin"
        : "user";
    const ativo =
      req.body?.ativo !== undefined ? Boolean(req.body.ativo) : true;
    if (!nome || !email || !senha)
      return res
        .status(400)
        .json({ error: "Nome, email e senha são obrigatórios." });
    const exists = await sql`SELECT id_user FROM users WHERE email = ${email}`;
    if (exists.length > 0)
      return res.status(400).json({ error: "Email já cadastrado." });
    const rows = await sql`
      INSERT INTO users (nome, senha, email, role_user, ativo)
      VALUES (${nome}, ${senha}, ${email}, ${roleUser}, ${ativo})
      RETURNING id_user, nome, email, role_user, ativo
    `;
    const row = rows[0];
    return res.status(201).json({
      user: {
        id_user: Number(row.id_user),
        nome: row.nome,
        email: row.email,
        role: row.role_user === "admin" ? "admin" : "user",
        role_id: row.role_user === "admin" ? 1 : 2,
        ativo: Boolean(row.ativo),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

//---------------------------------------------------------------------------------------------------

routes.put("/users/:id", requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const nome = String(req.body?.nome ?? req.body?.name ?? "").trim();
    const email = String(req.body?.email ?? "")
      .trim()
      .toLowerCase();
    const senha = String(req.body?.senha ?? req.body?.password ?? "").trim();
    const roleUser =
      String(req.body?.role_user ?? "user").toLowerCase() === "admin"
        ? "admin"
        : "user";
    const ativo =
      req.body?.ativo !== undefined ? Boolean(req.body.ativo) : true;
    if (!nome || !email)
      return res.status(400).json({ error: "Nome e email são obrigatórios." });
    let rows;
    if (senha) {
      rows = await sql`
        UPDATE users SET nome = ${nome}, senha = ${senha}, email = ${email}, role_user = ${roleUser}, ativo = ${ativo}
        WHERE id_user = ${id}
        RETURNING id_user, nome, email, role_user, ativo
      `;
    } else {
      rows = await sql`
        UPDATE users SET nome = ${nome}, email = ${email}, role_user = ${roleUser}, ativo = ${ativo}
        WHERE id_user = ${id}
        RETURNING id_user, nome, email, role_user, ativo
      `;
    }
    if (!rows[0])
      return res.status(404).json({ error: "Usuário não encontrado" });
    const row = rows[0];
    return res.status(200).json({
      user: {
        id_user: Number(row.id_user),
        nome: row.nome,
        email: row.email,
        role: row.role_user === "admin" ? "admin" : "user",
        role_id: row.role_user === "admin" ? 1 : 2,
        ativo: Boolean(row.ativo),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

//---------------------------------------------------------------------------------------------------

routes.delete("/users/:id", requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const rows =
      await sql`DELETE FROM users WHERE id_user = ${id} RETURNING id_user`;
    if (rows.length === 0)
      return res.status(404).json({ error: "Usuário não encontrado" });
    return res
      .status(200)
      .json({ deleted: true, id_user: Number(rows[0].id_user) });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

//===================================================================================================
//------------------------------------ USUARIOS - PUBLIC -------------------------------------------
//===================================================================================================

routes.post("/auth/login", async (req, res) => {
  try {
    const email = String(req.body?.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password ?? "").trim();
    if (!email || !password)
      return res.status(400).json({ error: "Email e senha são obrigatórios." });
    const rows =
      await sql`SELECT id_user, nome, email, senha, role_user, ativo FROM users WHERE email = ${email} LIMIT 1`;
    if (rows.length === 0 || rows[0].senha !== password)
      return res.status(401).json({ error: "Credenciais inválidas." });
    const user = rows[0];
    if (!user.ativo) return res.status(403).json({ error: "Usuário inativo." });
    const serializedUser = {
      id_user: Number(user.id_user),
      nome: user.nome,
      email: user.email,
      role: user.role_user === "admin" ? "admin" : "user",
      role_id: user.role_user === "admin" ? 1 : 2,
      ativo: Boolean(user.ativo),
    };
    const session = issueAccessSession(serializedUser);
    return res.status(200).json({
      ...serializedUser,
      access_token: session.accessToken,
      token_type: "bearer",
      expires_in: session.expiresIn,
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

//---------------------------------------------------------------------------------------------------

// Função simples para sanitizar texto (remove espaços e caracteres perigosos)
function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>"'`;]/g, '').trim();
}

// Função para criar usuário no banco
async function createUser({ nome, email, senha, role = 'user', ativo = true }) {
  const rows = await sql`
    INSERT INTO users (nome, senha, email, role_user, ativo)
    VALUES (${nome}, ${senha}, ${email}, ${role}, ${ativo})
    RETURNING id_user, nome, email, role_user, ativo
  `;
  return rows[0];
}

// Função para serializar usuário para resposta
function serializeUser(user) {
  return {
    id_user: Number(user.id_user),
    nome: user.nome,
    email: user.email,
    role: user.role_user === 'admin' ? 'admin' : 'user',
    role_id: user.role_user === 'admin' ? 1 : 2,
    ativo: Boolean(user.ativo),
  };
}

routes.post("/auth/register", async (req, res) => {
  try {
    const nome = sanitizeText(req.body?.name ?? req.body?.nome);
    const email = sanitizeText(req.body?.email).toLowerCase();
    const senha = sanitizeText(req.body?.password ?? req.body?.senha);

    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ error: "Nome, email e senha são obrigatórios." });
    }

    const exists = await sql`SELECT id_user FROM users WHERE email = ${email}`;
    if (exists.length > 0) {
      return res.status(400).json({ error: "Email já cadastrado." });
    }

    const created = await createUser({
      nome,
      email,
      senha,
      role: "user",
      ativo: true,
    });
    return res.status(201).json(serializeUser(created));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

//---------------------------------------------------------------------------------------------------

routes.get("/memorias", requireAuth, async (req, res) => {
  try {
    const idUsuario = Number(req.authUser?.id_user);
    if (!idUsuario) {
      return res.status(401).json({ error: "Usuário inválido na sessão." });
    }

    const tableName = await resolveMemoryTable();
    const rows = await sql.unsafe(
      `
      SELECT id_memoria, nome, tipo, subtipo, conteudo, id_user, data_mod
      FROM ${tableName}
      WHERE id_user = $1
      ORDER BY data_mod DESC NULLS LAST, id_memoria DESC
    `,
      [idUsuario]
    );

    return res.status(200).json({
      memorias: rows.map((row) => ({
        id_memoria: Number(row.id_memoria),
        nome: row.nome,
        tipo: row.tipo,
        subtipo: row.subtipo,
        conteudo: row.conteudo,
        id_user: Number(row.id_user),
        data: row.data_mod,
      })),
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

//---------------------------------------------------------------------------------------------------

routes.post("/memorias", requireAuth, async (req, res) => {
  try {
    const idUsuario = Number(req.authUser?.id_user);
    if (!idUsuario) {
      return res.status(401).json({ error: "Usuário inválido na sessão." });
    }

    const payload = validateMemoryPayload(req.body || {});
    const tableName = await resolveMemoryTable();

    const rows = await sql.unsafe(
      `
      INSERT INTO ${tableName} (nome, tipo, subtipo, conteudo, id_user, data_mod)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id_memoria, nome, tipo, subtipo, conteudo, id_user, data_mod
    `,
      [
        payload.nome,
        payload.tipo,
        "",
        JSON.stringify(payload.conteudo),
        idUsuario,
        payload.data,
      ]
    );

    return res.status(201).json({ memoria: rows[0] });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno do servidor";
    if (message.includes("Campo") || message.includes("Conteúdo") || message.includes("tipo")) {
      return res.status(400).json({ error: message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

//---------------------------------------------------------------------------------------------------

routes.put("/memorias/:id", requireAuth, async (req, res) => {
  try {
    const idUsuario = Number(req.authUser?.id_user);
    const idMemoria = Number(req.params.id);

    if (!idUsuario) {
      return res.status(401).json({ error: "Usuário inválido na sessão." });
    }

    if (!Number.isInteger(idMemoria) || idMemoria <= 0) {
      return res.status(400).json({ error: "ID de memória inválido." });
    }

    const payload = validateMemoryPayload(req.body || {});
    const tableName = await resolveMemoryTable();

    const rows = await sql.unsafe(
      `
      UPDATE ${tableName}
      SET nome = $1,
          tipo = $2,
          subtipo = $3,
          conteudo = $4,
          data_mod = $5
      WHERE id_memoria = $6
        AND id_user = $7
      RETURNING id_memoria, nome, tipo, subtipo, conteudo, id_user, data_mod
    `,
      [
        payload.nome,
        payload.tipo,
        "",
        JSON.stringify(payload.conteudo),
        payload.data,
        idMemoria,
        idUsuario,
      ]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: "Memória não encontrada." });
    }

    return res.status(200).json({ memoria: rows[0] });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno do servidor";
    if (message.includes("Campo") || message.includes("Conteúdo") || message.includes("tipo")) {
      return res.status(400).json({ error: message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

//---------------------------------------------------------------------------------------------------

routes.delete("/memorias/:id", requireAuth, async (req, res) => {
  try {
    const idUsuario = Number(req.authUser?.id_user);
    const idMemoria = Number(req.params.id);

    if (!idUsuario) {
      return res.status(401).json({ error: "Usuário inválido na sessão." });
    }

    if (!Number.isInteger(idMemoria) || idMemoria <= 0) {
      return res.status(400).json({ error: "ID de memória inválido." });
    }

    const tableName = await resolveMemoryTable();
    const rows = await sql.unsafe(
      `
      DELETE FROM ${tableName}
      WHERE id_memoria = $1
        AND id_user = $2
      RETURNING id_memoria
    `,
      [idMemoria, idUsuario]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: "Memória não encontrada." });
    }

    return res.status(200).json({ deleted: true, id_memoria: Number(rows[0].id_memoria) });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

//===================================================================================================
//------------------------------------ MEMORIA - ADMIN ----------------------------------------------
//===================================================================================================

routes.get("/memoria/:id", requireAdminAuth, async (req, res) => {
  try {
    const id_usuario = Number(req.params.id);
    const rows = await sql`
      SELECT id_memoria, nome, tipo, subtipo, conteudo, id_user
      FROM memoria
      WHERE id_user = ${id_usuario}
      ORDER BY nome ASC
    `;
    return res.status(200).json({
      memoria: rows.map((row) => ({
        id_memoria: Number(row.id_memoria),
        nome: row.nome,
        tipo: row.tipo,
        subtipo: row.subtipo,
        conteudo: row.conteudo,
        id_user: Number(row.id_user),
      })),
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

//---------------------------------------------------------------------------------------------------

routes.get("/dashboard/state", requireAuth, async (req, res) => {
  try {
    const idUsuario = Number(req.authUser?.id_user);
    if (!idUsuario)
      return res.status(401).json({ error: "Usuário inválido na sessão." });

    const rows = await sql`
      SELECT conteudo, data_mod
      FROM memoria
      WHERE id_user = ${idUsuario}
        AND tipo = 'estado'
      ORDER BY data_mod DESC NULLS LAST, id_memoria DESC
      LIMIT 3
    `;

    const payload = carregarDashboardEstado(rows);
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

//---------------------------------------------------------------------------------------------------

routes.post("/memoria/edit", requireAdminAuth, async (req, res) => {
  try {
    const { id_memoria, id_user, conteudo } = await edit_memory(req.body || {});

    const rows = await sql`
      UPDATE memoria
      SET conteudo = ${conteudo}
      WHERE id_memoria = ${id_memoria}
        AND id_user = ${id_user}
      RETURNING id_memoria, id_user
    `;

    if (!rows[0]) {
      return res
        .status(404)
        .json({ error: "Memória não encontrada para atualização." });
    }

    return res.status(200).json({
      updated: true,
      id_memoria: Number(rows[0].id_memoria),
      id_user: Number(rows[0].id_user),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno do servidor";
    if (message.includes("obrigatórios") || message.includes("conteudo")) {
      return res.status(400).json({ error: message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

//===================================================================================================
//------------------------------------ CHAT ----------------------------------------------
//===================================================================================================

routes.post("/chat", async (req, res) => {
  try {
    const { pergunta } = req.body || {};
    if (typeof pergunta !== "string" || !pergunta.trim()) {
      return res
        .status(400)
        .json({
          error:
            "Campo 'pergunta' é obrigatório e deve ser uma string não vazia.",
        });
    }

    const idUsuarioHeader = req.header("X-User-Id") || req.header("x-user-id");
    const usuarioId = Number(idUsuarioHeader);
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      return res
        .status(400)
        .json({
          error:
            "Header 'X-User-Id' é obrigatório e deve ser um inteiro válido.",
        });
    }

    const resposta = await executar_com_usuario(pergunta.trim(), usuarioId);
    return res.status(200).json({ resposta });
  } catch (error) {
    console.error("Erro no endpoint /chat:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default routes;
