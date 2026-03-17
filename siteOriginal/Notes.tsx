import { useState } from "react";
import { FileText, Search, Brain, Calendar, ChevronRight, Plus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  title: string;
  category: "anatomico" | "psicologico" | "treino" | "geral";
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isAIGenerated: boolean;
}

const mockNotes: Note[] = [
  {
    id: "1",
    title: "Análise Anatômica - Proporções de Membros",
    category: "anatomico",
    content: "Braços relativamente longos em comparação ao tronco. Isso favorece o levantamento terra convencional. Considerando a proporção fêmur/tíbia, o agachamento low bar com stance mais aberto é mais indicado.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isAIGenerated: true,
  },
  {
    id: "2",
    title: "Perfil Psicológico - Resposta ao Stress",
    category: "psicologico",
    content: "Atleta demonstra melhor performance em treinos com estrutura clara e metas definidas. Semanas de deload programadas são essenciais para evitar burnout. Responde bem a desafios progressivos.",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    isAIGenerated: true,
  },
  {
    id: "3",
    title: "Lesão Ombro Esquerdo - Histórico",
    category: "anatomico",
    content: "Histórico de tendinite no manguito rotador esquerdo em 2023. Evitar pegada muito fechada no supino. Manter trabalho de mobilidade e fortalecimento externo.",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    isAIGenerated: false,
  },
  {
    id: "4",
    title: "Preferência de Periodização",
    category: "treino",
    content: "Respondeu muito bem ao DUP (Daily Undulating Periodization). Blocos de 4 semanas com deload na 4ª semana mostraram melhores resultados que programas lineares.",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    isAIGenerated: true,
  },
  {
    id: "5",
    title: "Metas de Competição 2024",
    category: "geral",
    content: "Objetivo: participar do campeonato estadual em outubro. Metas de total: 550kg (200 agachamento, 130 supino, 220 terra). Peso alvo: 83kg.",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    isAIGenerated: false,
  },
];

const categoryConfig = {
  anatomico: { label: "Anatômico", color: "bg-blue-500/20 text-blue-400" },
  psicologico: { label: "Psicológico", color: "bg-purple-500/20 text-purple-400" },
  treino: { label: "Treino", color: "bg-green-500/20 text-green-400" },
  geral: { label: "Geral", color: "bg-gray-500/20 text-gray-400" },
};

export default function Notes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const filteredNotes = mockNotes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <AppLayout>
      <div className="flex h-screen">
        {/* Sidebar - Notes List */}
        <div className={cn(
          "w-full md:w-96 border-r border-border flex flex-col",
          selectedNote && "hidden md:flex"
        )}>
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-display font-bold text-foreground">
                Anotações
              </h1>
              <Button size="icon" variant="outline">
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar anotações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                  !selectedCategory
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                Todas
              </button>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                    selectedCategory === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={cn(
                  "w-full p-4 text-left border-b border-border/50 hover:bg-muted/30 transition-all",
                  selectedNote?.id === note.id && "bg-muted/50"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-foreground line-clamp-1">
                    {note.title}
                  </h3>
                  {note.isAIGenerated && (
                    <Brain className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {note.content}
                </p>
                <div className="flex items-center gap-2">
                  <span className={cn("px-2 py-0.5 rounded-full text-xs", categoryConfig[note.category].color)}>
                    {categoryConfig[note.category].label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(note.updatedAt)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content - Note Detail */}
        <div className={cn(
          "flex-1 flex flex-col",
          !selectedNote && "hidden md:flex"
        )}>
          {selectedNote ? (
            <>
              <div className="p-6 border-b border-border">
                <button
                  onClick={() => setSelectedNote(null)}
                  className="md:hidden flex items-center gap-2 text-muted-foreground mb-4"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  Voltar
                </button>
                
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs", categoryConfig[selectedNote.category].color)}>
                        {categoryConfig[selectedNote.category].label}
                      </span>
                      {selectedNote.isAIGenerated && (
                        <span className="flex items-center gap-1 text-xs text-primary">
                          <Brain className="h-3 w-3" />
                          Gerado pela IA
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-display font-bold text-foreground">
                      {selectedNote.title}
                    </h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Criado: {formatDate(selectedNote.createdAt)}
                      </span>
                      <span>Atualizado: {formatDate(selectedNote.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <div className="prose prose-invert max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedNote.content}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione uma anotação para visualizar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
