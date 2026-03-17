import { useState, useRef, useEffect } from "react";
import { Send, Brain, User, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Olá! Sou o Synapse, sua IA especializada em powerlifting. Tenho acesso completo ao seu perfil psicológico e anatômico, além de todo o histórico de treinos. Como posso ajudar você hoje?",
    timestamp: new Date(),
  },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulated AI response - will be replaced with actual AI integration
    setTimeout(() => {
      const aiResponses = [
        "Baseado no seu perfil anatômico e histórico de treinos, recomendo focar em trabalho de mobilidade de quadril antes do agachamento. Seus últimos treinos mostraram uma tendência de inclinação anterior do tronco.",
        "Analisando seu perfil psicológico, você responde bem a periodizações com semanas de deload programadas. Vamos ajustar seu próximo ciclo com isso em mente.",
        "Considerando suas proporções de membros e pontos de inserção muscular, o sumo deadlift pode ser mais vantajoso para você. Quer que eu elabore um programa de transição?",
      ];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="p-6 border-b border-border bg-background-elevated/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <h1 className="font-display font-bold text-foreground">Synapse AI</h1>
              <p className="text-sm text-muted-foreground">Memória ativa • Online</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4 animate-fade-in",
                message.role === "user" && "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
                  message.role === "assistant"
                    ? "bg-gradient-to-br from-primary to-secondary"
                    : "bg-secondary"
                )}
              >
                {message.role === "assistant" ? (
                  <Brain className="h-5 w-5 text-primary-foreground" />
                ) : (
                  <User className="h-5 w-5 text-secondary-foreground" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[70%] rounded-2xl px-5 py-3",
                  message.role === "assistant"
                    ? "bg-card border border-border"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <span className="text-xs text-muted-foreground mt-2 block">
                  {message.timestamp.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 animate-fade-in">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="bg-card border border-border rounded-2xl px-5 py-4">
                <div className="flex gap-1">
                  <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick suggestions */}
        <div className="px-6 py-3 border-t border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["Analisar meu último treino", "Sugerir próximo treino", "Ver meu perfil anatômico"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="flex-shrink-0 px-4 py-2 bg-muted/50 hover:bg-muted rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-6 border-t border-border bg-background-elevated/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 h-12 px-5 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
            <Button 
              type="submit" 
              size="lg"
              disabled={!input.trim() || isLoading}
              className="h-12 px-6"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
