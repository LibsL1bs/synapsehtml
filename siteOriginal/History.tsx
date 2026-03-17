import { Calendar, Clock, Dumbbell, TrendingUp, ChevronRight, Weight } from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";

interface WorkoutHistory {
  id: string;
  date: Date;
  name: string;
  duration: string;
  exerciseCount: number;
  totalVolume: number;
  highlights: string[];
}

const mockWorkouts: WorkoutHistory[] = [
  {
    id: "1",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    name: "Força - Agachamento",
    duration: "1h 23min",
    exerciseCount: 5,
    totalVolume: 12500,
    highlights: ["PR Agachamento: 180kg x 3"],
  },
  {
    id: "2",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    name: "Força - Supino",
    duration: "1h 05min",
    exerciseCount: 4,
    totalVolume: 8200,
    highlights: [],
  },
  {
    id: "3",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    name: "Força - Levantamento Terra",
    duration: "1h 35min",
    exerciseCount: 4,
    totalVolume: 15600,
    highlights: ["PR Terra: 220kg x 2"],
  },
  {
    id: "4",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    name: "Acessórios - Costas",
    duration: "55min",
    exerciseCount: 6,
    totalVolume: 6800,
    highlights: [],
  },
  {
    id: "5",
    date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    name: "Força - Agachamento",
    duration: "1h 18min",
    exerciseCount: 5,
    totalVolume: 11200,
    highlights: [],
  },
];

export default function History() {
  const formatDate = (date: Date) => {
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `${diffDays} dias atrás`;

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  const totalWorkouts = mockWorkouts.length;
  const totalVolume = mockWorkouts.reduce((acc, w) => acc + w.totalVolume, 0);
  const avgDuration = "1h 15min";

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-display font-bold text-foreground mb-6">
            Histórico de Treinos
          </h1>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-primary">{totalWorkouts}</div>
              <div className="text-xs text-muted-foreground mt-1">Treinos</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {(totalVolume / 1000).toFixed(1)}t
              </div>
              <div className="text-xs text-muted-foreground mt-1">Volume Total</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{avgDuration}</div>
              <div className="text-xs text-muted-foreground mt-1">Duração Média</div>
            </div>
          </div>
        </div>

        {/* Workout List */}
        <div className="p-6 space-y-3">
          {mockWorkouts.map((workout) => (
            <Link
              key={workout.id}
              to={`/history/${workout.id}`}
              className="block glass-card p-4 hover:bg-card/90 transition-all group animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(workout.date)}
                    </span>
                    {workout.highlights.length > 0 && (
                      <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full font-medium">
                        PR
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{workout.name}</h3>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {workout.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Dumbbell className="h-4 w-4" />
                      {workout.exerciseCount} exercícios
                    </div>
                    <div className="flex items-center gap-1">
                      <Weight className="h-4 w-4" />
                      {(workout.totalVolume / 1000).toFixed(1)}t
                    </div>
                  </div>

                  {workout.highlights.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm text-primary font-medium">
                        {workout.highlights[0]}
                      </span>
                    </div>
                  )}
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
