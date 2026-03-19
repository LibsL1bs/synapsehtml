import json
import re
from langchain_ollama import OllamaLLM
import os
from pathlib import Path
from datetime import date
import requests


from main import _conteudo_para_texto

BASE_DIR = Path(__file__).parent
modelo_decisao = OllamaLLM(model="llama3", temperature=0.1)
modelo_resposta = OllamaLLM(model="llama3", temperature=0.1)

database_url = "postgresql://postgres:12345678@localhost:5432/postgres"
API_BASE_URL = "http://localhost:8000"

JSON_BLOCK_PATTERN = re.compile(r"\{.*\}", re.DOTALL)

usuario_id = 1 # ID do usuário para teste, substitua conforme necessário

decisao_teste = """{
        "leitura_necessaria": true,
        "anotacao_necessaria": true,
        "arquivos_para_anotacao": [
        {
                "arquivo": "medidas corporais",
                "resumo": "Nova medida de braço"
        },
        {
                "arquivo": "estado 2026/03/03",
                "resumo": "Sono na quinta"
        }
        ]
}"""




#==============================================================================
#------- UTILITARIOS ----------------------------------------------------------
#==============================================================================

def gerar_lista_nomes_descricoes_index(usuario_id: int | None = None) -> list[dict[str, str]]:
    # Busca lista de memórias do usuário pela nova API
    url = f"{API_BASE_URL}/memoria/{usuario_id}"
    try:
        resp = requests.get(url, headers={"X-Request-Source": "admin"})
        resp.raise_for_status()
        data = resp.json()
        memorias = data.get("memoria", [])
    except Exception as e:
        print(f"Erro ao buscar memórias: {e}")
        memorias = []

    lista_index: list[dict[str, str]] = []
    for memoria in memorias:
        nome = str(memoria.get("nome") or "").strip()
        descricao = str(memoria.get("subtipo") or "").strip()  # subtipo como descrição
        lista_index.append({
            "nome": nome,
            "descricao": descricao,
        })
    print(lista_index)
    
    lista_index: list[dict[str, str]] = []

    for memoria in memorias:
        nome = str(memoria.get("nome") or "").strip()
        descricao = str(memoria.get("descricao") or "").strip()
        lista_index.append(
            {
                "nome": nome,
                "descricao": descricao,
            }
        )
    print(lista_index)

    return lista_index

## Removido: conexão direta com Postgres


def extract_json(text: str) -> list[object]:
    if not isinstance(text, str) or not text:
        return []

    decoder = json.JSONDecoder()
    results: list[object] = []
    cursor = 0
    length = len(text)

    while cursor < length:
        start_obj = text.find("{", cursor)
        start_arr = text.find("[", cursor)

        candidates = [idx for idx in (start_obj, start_arr) if idx != -1]
        if not candidates:
            break

        start = min(candidates)

        try:
            parsed, end = decoder.raw_decode(text[start:])
            results.append(parsed)
            cursor = start + end
        except json.JSONDecodeError:
            cursor = start + 1

    return results









#==============================================================================
#------- DECISÃO --------------------------------------------------------------
#==============================================================================

def decisão(pergunta, lista_index):
    prompt = f"""
Você é um classificador de ações para um sistema de treino de powerlifting.

Sua tarefa NÃO é responder à pergunta do usuário.

Sua tarefa é apenas decidir:

Se é necessário ler arquivos existentes.

Quais arquivos precisam ser lidos.

Se há novas informações objetivas que devem ser anotadas.

Em quais arquivos essas informações devem ser anotadas.

Você receberá a lista de arquivos disponíveis com suas descrições.
Use apenas arquivos dessa lista.

========================

DEFINIÇÕES

LEITURA é necessária quando a pergunta exige:

Análise de estado atual baseado em histórico

Comparação com dados anteriores

Tendência ou evolução

Interpretação dependente de dados salvos

ANOTAÇÃO é necessária quando o usuário fornece nova informação objetiva, como:

Peso, carga, repetição

Horas dormidas

Medidas corporais

Sintomas ou dores

Qualquer dado factual específico

Mesmo que o usuário escreva de forma imprecisa, considere a intenção semântica da frase.

========================

REGRAS IMPORTANTES

Pode haver leitura sem anotação.

Pode haver anotação sem leitura.

Pode haver ambas.

Pode haver nenhuma.

Nunca invente arquivos.

Use somente arquivos listados no índice.

Não escreva nada fora do JSON.

Não explique suas decisões.

========================

FORMATO DE SAÍDA (OBRIGATÓRIO)

{{
	"leitura_necessaria": true/false,
	"arquivos_para_leitura": ["nome_do_arquivo"],
	"anotacao_necessaria": true/false,
	"arquivos_para_anotacao": [
	{{
		"arquivo": "nome_do_arquivo",
		"resumo": "resumo objetivo da informação a ser registrada"
	}}
	]
}}

Regras de formato:

qualquer texto fora do JSON é inválido

Se leitura_necessaria for false, retorne "arquivos_para_leitura": []

Se anotacao_necessaria for false, retorne "arquivos_para_anotacao": []

Nunca adicione campos extras.

Sempre retorne JSON válido.

========================

ARQUIVOS DISPONÍVEIS:
{lista_index}

PERGUNTA DO USUÁRIO:
{pergunta}
"""

    resp = modelo_decisao.invoke(prompt)
    #print("[DECISÃO IA]:", resp)
    return resp




#==============================================================================
#------- AÇÕES ----------------------------------------------------------------
#==============================================================================

#------- ANOTAÇÃO --------------------------------------
def executar_anotacao(contexto, pergunta):
	
	prompt=f"""
você é um agente gerenciador de dados

sua tarefa é extrair informações objetivas da mensagem do usuário e atualizar arquivos existentes.

sua tarefa NÃO é responder o usuário.

------------------------------------------------

MENSAGEM DO USUÁRIO:
{pergunta}

------------------------------------------------

ARQUIVOS DISPONÍVEIS PARA ATUALIZAÇÃO:

{contexto}

cada arquivo possui:
- nome
- data da última nota
- conteúdo atual

------------------------------------------------

PROCESSO OBRIGATÓRIO:

analise cada arquivo individualmente seguindo estes passos:

1. leia o conteúdo do arquivo
2. verifique se a mensagem do usuário contém informações relevantes para este arquivo
3. se houver informação relevante:
   atualize o conteúdo adicionando ou modificando apenas as informações mencionadas
4. se NÃO houver informação relevante:
   mantenha o conteúdo exatamente igual

repita esse processo para TODOS os arquivos listados.

------------------------------------------------

REGRAS OBRIGATÓRIAS:

NUNCA invente informações que não foram mencionadas pelo usuário

NUNCA misture informações entre arquivos

NUNCA copie informações destinadas a um arquivo para outro

se não houver atualização para um arquivo, mantenha o conteúdo original

NUNCA responda à mensagem do usuário

NUNCA escreva texto fora do JSON

NÃO adicione campos novos ao JSON

------------------------------------------------

FORMATO DE SAÍDA (JSON VÁLIDO):

{{
  "arquivos": [
    {{
      "nome": "nome_do_arquivo",
      "data_nota": "data_atual",
      "conteudo": "conteudo_editado_ou_original"
    }}
  ]
}}

------------------------------------------------

REGRAS DO JSON:

a lista "arquivos" deve conter exatamente a mesma quantidade de arquivos que foi fornecida no contexto

cada objeto deve corresponder ao arquivo com o mesmo nome

qualquer texto fora do JSON é inválido
"""
	resp = modelo_resposta.invoke(prompt)
	print(extract_json(resp))
    

#------- LEITURA ---------------------------------------	
def executar_leitura(leitura_total):
	pass



#------- RESPOSTA --------------------------------------
def executar_resposta():
	pass











#==============================================================================
#------- ORGANIZAR AÇÕES ------------------------------------------------------
#==============================================================================

def organizar_plano(decisao, pergunta):
    decisao_dict = json.loads(decisao) if isinstance(decisao, str) else decisao

    leitura_necessaria = bool(decisao_dict.get("leitura_necessaria"))
    arquivos_para_leitura = decisao_dict.get("arquivos_para_leitura", []) or []

    escrita_necessaria = bool(decisao_dict.get("anotacao_necessaria"))
    arquivos_para_anotacao = decisao_dict.get("arquivos_para_anotacao", []) or []

    leitura_total = []
    contexto_total_anotacao = []
    
    #====================================================================================================================
    for arquivo in arquivos_para_anotacao:
        nome = arquivo.get("arquivo")
        # Busca conteúdo do arquivo pela nova API
        url = f"{API_BASE_URL}/memoria/{usuario_id}"
        try:
            resp = requests.get(url, headers={"X-Request-Source": "admin"})
            resp.raise_for_status()
            data = resp.json()
            memoria_list = data.get("memoria", [])
            memoria = next((m for m in memoria_list if m.get("nome") == nome), None)
        except Exception as e:
            print(f"Erro ao buscar memória '{nome}': {e}")
            memoria = None

        if memoria is None:
            print(f"Arquivo '{nome}' não encontrado para o usuário {usuario_id}.")
            continue

        contexto_total_anotacao.append({
            "arquivo": nome,
            "data_nota": "",  # data_mod não está disponível diretamente
            "conteudo": memoria.get("conteudo", ""),
        })

    if escrita_necessaria:
        executar_anotacao(contexto_total_anotacao, pergunta)
        
#--------------------------------------------------------------------

    for arquivo in arquivos_para_leitura:
        # Busca conteúdo do arquivo pela nova API
        url = f"{API_BASE_URL}/memoria/{usuario_id}"
        try:
            resp = requests.get(url, headers={"X-Request-Source": "admin"})
            resp.raise_for_status()
            data = resp.json()
            memoria_list = data.get("memoria", [])
            memoria = next((m for m in memoria_list if m.get("nome") == arquivo), None)
        except Exception as e:
            print(f"Erro ao buscar memória '{arquivo}': {e}")
            memoria = None

        if memoria is None:
            print(f"Arquivo '{arquivo}' não encontrado para o usuário {usuario_id}.")
            continue

        leitura_total.append({
            "arquivo": arquivo,
            "data_nota": "",  # data_mod não está disponível diretamente
            "indice_confianca": None,
            "conteudo": memoria.get("conteudo", ""),
        })

    if leitura_necessaria:
         executar_leitura(leitura_total)
#====================================================================================================================




#==============================================================================
#------- CHAMA A IA -----------------------------------------------------------
#==============================================================================

def executar():
	#input_usuario = input("Digite sua pergunta: ")
	input_usuario = "medi meu braço e deu 45cm. dormi 3 horas na quinta"

	#decisao = decisão(input_usuario, gerar_lista_nomes_descricoes_index(11))

	organizar_plano(decisao_teste ,input_usuario)
     

executar()


















