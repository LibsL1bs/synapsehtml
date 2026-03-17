from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from chatbot import executar

app = FastAPI()

# ===============================
# CORS (frontend separado)
# ===============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # em dev
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================
# MODELO DE ENTRADA
# ===============================
class Pergunta(BaseModel):
    pergunta: str

# ===============================
# ROTA PRINCIPAL DO CHAT
# ===============================
@app.post("/chat")
def chat(dados: Pergunta):
    print("PERGUNTA RECEBIDA:", dados.pergunta)

    resposta = executar(dados.pergunta)

    print("RESPOSTA GERADA:", resposta)

    return {
        "resposta": resposta
    }


# ===============================
# ROTA DE TESTE
# ===============================
@app.get("/")
def status():
    return { "status": "ok" }
