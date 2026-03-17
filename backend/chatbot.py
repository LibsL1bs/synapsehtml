import json
from langchain_ollama import OllamaLLM
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent
from langchain_ollama import OllamaLLM

modelo = OllamaLLM(
    model="mistral",
    base_url="http://localhost:11434"
)


#=====================================================================
#---------------------CARREGA O INDEX DE DADOS------------------------
#=====================================================================

BASE_DIR = Path(__file__).resolve().parent
INDEX_PATH = BASE_DIR / "data" / "index.json"
def carregar_index():
    with open(INDEX_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

index = carregar_index()
arquivos_index = index["arquivos"]
treinos_index = index["treinos"]

# Conjuntos de arquivos permitidos (blindagem)
ARQUIVOS_PERMITIDOS = {a["arquivo"] for a in arquivos_index}
TREINOS_PERMITIDOS = {t["arquivo"] for t in treinos_index}
ARQUIVOS_VALIDOS = ARQUIVOS_PERMITIDOS | TREINOS_PERMITIDOS


#=====================================================================
#---------------------------UTILITÁRIOS-------------------------------
#=====================================================================

def limpar_nome_arquivo(nome):
    return nome.replace('"', '').replace("'", '').strip()


#=====================================================================
#-------------------------PROMPT DE DECISÃO---------------------------
#=====================================================================

def acao1(pergunta):
    prompt = f"""
Você é um assistente treinador de powerlifting.

SUA TAREFA NÃO É RESPONDER A PERGUNTA.
Sua tarefa é APENAS decidir a ação correta do sistema.

========================
AÇÕES DISPONÍVEIS
========================

1. APENAS_RESPONDER  
Use quando a pergunta puder ser respondida com CONHECIMENTO GERAL.

Exemplos:
- regras do powerlifting
- exercícios de competição
- conceitos básicos de treino
- educação geral sobre força

2. LER_ARQUIVO  
Use SOMENTE quando a pergunta exigir informações ESPECÍFICAS
já registradas sobre o USUÁRIO.

3. FAZER_ANOTACAO  
Use SOMENTE quando o usuário fornecer uma informação nova
objetiva que deva ser salva.

========================
ARQUIVOS DISPONÍVEIS
========================

ARQUIVOS DO USUÁRIO:
{arquivos_index}

TREINOS REGISTRADOS:
{treinos_index}

========================
REGRAS OBRIGATÓRIAS
========================

- Nunca invente nomes de arquivos
- Use SOMENTE arquivos listados acima
- Se nenhum arquivo for necessário, use APENAS_RESPONDER
- Se houver dúvida, escolha APENAS_RESPONDER
- Responda SOMENTE em JSON válido
- Não escreva explicações
- Não escreva texto fora do JSON
- NÃO responda a pergunta do usuario, apenas decida a ação

========================
FORMATOS PERMITIDOS
========================

{{ "acao": "APENAS_RESPONDER" }}

{{ "acao": "LER_ARQUIVO", "arquivos": ["arquivo.json"] }}

{{ "acao": "FAZER_ANOTACAO", "arquivo": "arquivo.json", "anotacao": "texto curto" }}

========================
PERGUNTA DO USUÁRIO
========================
{pergunta}
"""

    resp = modelo.invoke(prompt)
    print("[DECISÃO IA]:", resp)
    return resp


#=====================================================================
#---------------------PROCESSAMENTO DA DECISÃO------------------------
#=====================================================================

def verificar_decisao(resposta_ia, pergunta):
    try:
        dados = json.loads(resposta_ia)
    except json.JSONDecodeError:
        print("ERRO: resposta da IA não é JSON válido")
        resposta_simples(pergunta)
        return

    acao = dados.get("acao")

    # ------------------ VALIDAÇÃO DA AÇÃO ------------------

    if acao not in {"LER_ARQUIVO", "FAZER_ANOTACAO", "APENAS_RESPONDER"}:
        print("ERRO: ação inválida")
        resposta_simples(pergunta)
        return

    # ------------------ VALIDAÇÃO DE ARQUIVOS ------------------

    if acao == "LER_ARQUIVO":
        arquivos = dados.get("arquivos", [])

        arquivos_validos = []
        for nome in arquivos:
            nome = limpar_nome_arquivo(nome)

            if nome not in ARQUIVOS_VALIDOS:
                print(f"ERRO: IA tentou usar arquivo não listado: {nome}")
            else:
                arquivos_validos.append(nome)

        # Fallback automático
        if not arquivos_validos:
            print("Nenhum arquivo válido. Usando APENAS_RESPONDER.")
            resposta_simples(pergunta)
            return

        executar_leitura(arquivos_validos, pergunta)

    elif acao == "FAZER_ANOTACAO":
        executar_escrita(
            limpar_nome_arquivo(dados.get("arquivo")),
            dados.get("anotacao", ""),
            pergunta
        )

    else:
        resposta_simples(pergunta)


#=====================================================================
#-----------------------RESPOSTA SIMPLES-------------------------------
#=====================================================================

def resposta_simples(pergunta):
    prompt = f"""
Você é um assistente treinador de powerlifting.
Responda de forma clara, objetiva e correta, e direta, sem rodeios, a seguinte pergunta do usuário, utilizando apenas conhecimento geral.

Pergunta:
{pergunta}
"""
    resp = modelo.invoke(prompt)
    resposta_final = resp
    return resposta_final


#=====================================================================
#-----------------------LEITURA DE DADOS-------------------------------
#=====================================================================

def executar_leitura(arquivos, pergunta):
    conteudos = []

    for nome in arquivos:
        caminho = BASE_DIR / nome
        with open(caminho, "r", encoding="utf-8") as f:
            conteudos.append(f"ARQUIVO: {nome}\n{f.read()}")

    contexto = "\n--------------------\n".join(conteudos)

    prompt = f"""
Você é um assistente treinador de powerlifting.
Utilize o contexto abaixo para responder a pergunta.

CONTEXTO:
--------------------
{contexto}
--------------------

Pergunta:
{pergunta}
"""
    resp = modelo.invoke(prompt)
    resposta_final = resp
    return resposta_final


#=====================================================================
#-----------------------ESCRITA DE DADOS-------------------------------
#=====================================================================

def executar_escrita(arquivo, texto, pergunta):
    caminho = BASE_DIR / arquivo

    with open(caminho, "a", encoding="utf-8") as f:
        f.write("\n" + texto + "\n")

    prompt = f"""
Uma anotação foi salva com sucesso.

Arquivo: {arquivo}
Conteúdo:
{texto}

Mensagem do usuário:
{pergunta}
"""
    resp = modelo.invoke(prompt)
    resposta_final = resp
    return resposta_final


#=====================================================================
#-----------------------------EXECUÇÃO--------------------------------
#=====================================================================

def executar(pergunta: str) -> str:
    try:
        print("Chamando IA...")
        resposta = modelo.invoke(pergunta)
        print("Resposta bruta da IA:", resposta)
        return resposta
    except Exception as e:
        print("ERRO NA IA:", e)
        return None
