import express from "express";
import sql from "./database.js";
import { issueAccessSession } from "./authSession.js";
import requireAdminAuth from "./middlewares/requireAdminAuth.js";
import requireAuth from "./middlewares/requireAuth.js";
import { carregarDashboardEstado } from "./middlewares/load_state.js";
import { edit_memory } from "./middlewares/memory_tree.js";
import { executar_com_usuario } from "./chatbotv3.js";

const routes = express.Router();

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
