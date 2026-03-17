import { Link } from "react-router-dom";
import { ArrowRight, Brain, Dumbbell, LineChart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export default function Index() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px]" />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between p-6 lg:px-12">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="lg">
                Entrar
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="hero" size="lg">
                Começar
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32 lg:pt-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-sm text-primary mb-8 animate-fade-in">
              <Brain className="h-4 w-4" />
              IA com memória robusta para powerlifting
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 animate-fade-in">
              Treine com uma IA que
              <span className="block gradient-text">conhece você</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in">
              O Synapse aprende sobre seu perfil psicológico e anatômico para criar 
              treinos verdadeiramente personalizados de powerlifting.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
              <Link to="/signup">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Começar Agora
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="glass" size="xl" className="w-full sm:w-auto">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Por que o Synapse é diferente?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Combinamos inteligência artificial avançada com conhecimento profundo de powerlifting.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "Memória Robusta",
                description: "O Synapse lembra de cada detalhe sobre você, seus treinos, lesões e preferências.",
              },
              {
                icon: Dumbbell,
                title: "Foco em Powerlifting",
                description: "Especializado em agachamento, supino e levantamento terra. Não é um app genérico.",
              },
              {
                icon: LineChart,
                title: "Análise Inteligente",
                description: "Periodização baseada em dados reais do seu progresso e recuperação.",
              },
              {
                icon: Shield,
                title: "Perfil Anatômico",
                description: "Considera suas proporções corporais para otimizar a técnica.",
              },
              {
                icon: Brain,
                title: "Perfil Psicológico",
                description: "Entende como você responde a diferentes tipos de estímulo e stress.",
              },
              {
                icon: Dumbbell,
                title: "Anotação de Treinos",
                description: "Interface inspirada nos melhores apps de treino, simples e eficiente.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="glass-card p-6 hover:bg-card/90 transition-all group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0" style={{ background: 'var(--gradient-glow)' }} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Pronto para treinar de forma inteligente?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Junte-se aos atletas que já estão usando o Synapse para alcançar seus objetivos no powerlifting.
              </p>
              <Link to="/signup">
                <Button variant="hero" size="xl">
                  Criar Conta Gratuita
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">
            © 2024 Synapse. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
