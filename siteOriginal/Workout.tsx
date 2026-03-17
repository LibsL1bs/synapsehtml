import { useState } from "react";
import { Plus, Trash2, Clock, Weight, RotateCcw, Check, ChevronDown, ChevronUp, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppLayout } from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ExerciseSet {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
  rpe?: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  isExpanded: boolean;
  notes: string;
}

const defaultExercises: Exercise[] = [
  {
    id: "1",
    name: "Agachamento (Squat)",
    sets: [
      { id: "1-1", weight: "100", reps: "5", completed: false },
      { id: "1-2", weight: "100", reps: "5", completed: false },
      { id: "1-3", weight: "100", reps: "5", completed: false },
    ],
    isExpanded: true,
    notes: "",
  },
];

export default function Workout() {
  const [exercises, setExercises] = useState<Exercise[]>(defaultExercises);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const { toast } = useToast();

  const startWorkout = () => {
    setWorkoutStarted(true);
    // Timer logic would go here
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: "Novo Exercício",
      sets: [{ id: `${Date.now()}-1`, weight: "", reps: "", completed: false }],
      isExpanded: true,
      notes: "",
    };
    setExercises([...exercises, newExercise]);
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter((e) => e.id !== exerciseId));
  };

  const addSet = (exerciseId: string) => {
    setExercises(
      exercises.map((e) => {
        if (e.id === exerciseId) {
          const lastSet = e.sets[e.sets.length - 1];
          return {
            ...e,
            sets: [
              ...e.sets,
              {
                id: `${exerciseId}-${Date.now()}`,
                weight: lastSet?.weight || "",
                reps: lastSet?.reps || "",
                completed: false,
              },
            ],
          };
        }
        return e;
      })
    );
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(
      exercises.map((e) => {
        if (e.id === exerciseId) {
          return {
            ...e,
            sets: e.sets.filter((s) => s.id !== setId),
          };
        }
        return e;
      })
    );
  };

  const updateSet = (exerciseId: string, setId: string, field: keyof ExerciseSet, value: string | boolean) => {
    setExercises(
      exercises.map((e) => {
        if (e.id === exerciseId) {
          return {
            ...e,
            sets: e.sets.map((s) => {
              if (s.id === setId) {
                return { ...s, [field]: value };
              }
              return s;
            }),
          };
        }
        return e;
      })
    );
  };

  const updateExerciseName = (exerciseId: string, name: string) => {
    setExercises(
      exercises.map((e) => {
        if (e.id === exerciseId) {
          return { ...e, name };
        }
        return e;
      })
    );
  };

  const toggleExpanded = (exerciseId: string) => {
    setExercises(
      exercises.map((e) => {
        if (e.id === exerciseId) {
          return { ...e, isExpanded: !e.isExpanded };
        }
        return e;
      })
    );
  };

  const finishWorkout = () => {
    toast({
      title: "Treino salvo!",
      description: `Duração: ${formatTime(elapsedTime)}. O Synapse analisará seus dados.`,
    });
  };

  const completedSets = exercises.reduce(
    (acc, e) => acc + e.sets.filter((s) => s.completed).length,
    0
  );
  const totalSets = exercises.reduce((acc, e) => acc + e.sets.length, 0);

  return (
    <AppLayout>
      <div className="min-h-screen pb-24">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">
                  {workoutStarted ? "Treino em andamento" : "Novo Treino"}
                </h1>
                {workoutStarted && (
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
                  </div>
                )}
              </div>
              {!workoutStarted ? (
                <Button onClick={startWorkout} size="lg" className="gap-2">
                  <Dumbbell className="h-5 w-5" />
                  Iniciar Treino
                </Button>
              ) : (
                <Button onClick={finishWorkout} variant="hero" size="lg">
                  Finalizar
                </Button>
              )}
            </div>

            {workoutStarted && (
              <div className="mt-4 bg-card rounded-lg p-3 border border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium text-foreground">
                    {completedSets}/{totalSets} séries
                  </span>
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                    style={{ width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Exercises */}
        <div className="p-6 space-y-4">
          {exercises.map((exercise, exerciseIndex) => (
            <div
              key={exercise.id}
              className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in"
            >
              {/* Exercise Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleExpanded(exercise.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                    <span className="font-bold text-secondary-foreground">
                      {exerciseIndex + 1}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={exercise.name}
                    onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-transparent font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-2 py-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {exercise.sets.filter((s) => s.completed).length}/{exercise.sets.length}
                  </span>
                  {exercise.isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Sets */}
              {exercise.isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  {/* Headers */}
                  <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium px-2">
                    <div className="col-span-1">SET</div>
                    <div className="col-span-3 flex items-center gap-1">
                      <Weight className="h-3 w-3" /> PESO
                    </div>
                    <div className="col-span-3 flex items-center gap-1">
                      <RotateCcw className="h-3 w-3" /> REPS
                    </div>
                    <div className="col-span-3">RPE</div>
                    <div className="col-span-2"></div>
                  </div>

                  {/* Set Rows */}
                  {exercise.sets.map((set, setIndex) => (
                    <div
                      key={set.id}
                      className={cn(
                        "grid grid-cols-12 gap-2 items-center p-2 rounded-lg transition-all",
                        set.completed && "bg-primary/10"
                      )}
                    >
                      <div className="col-span-1">
                        <span
                          className={cn(
                            "font-bold",
                            set.completed ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          {setIndex + 1}
                        </span>
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          value={set.weight}
                          onChange={(e) =>
                            updateSet(exercise.id, set.id, "weight", e.target.value)
                          }
                          placeholder="kg"
                          className="h-10 text-center"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          value={set.reps}
                          onChange={(e) =>
                            updateSet(exercise.id, set.id, "reps", e.target.value)
                          }
                          placeholder="reps"
                          className="h-10 text-center"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          value={set.rpe || ""}
                          onChange={(e) =>
                            updateSet(exercise.id, set.id, "rpe", e.target.value)
                          }
                          placeholder="1-10"
                          className="h-10 text-center"
                        />
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateSet(exercise.id, set.id, "completed", !set.completed)
                          }
                          className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center transition-all",
                            set.completed
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80"
                          )}
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => removeSet(exercise.id, set.id)}
                          className="h-10 w-10 rounded-lg bg-muted hover:bg-destructive/20 hover:text-destructive flex items-center justify-center transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Set Button */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => addSet(exercise.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Série
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeExercise(exercise.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add Exercise Button */}
          <Button
            variant="outline"
            className="w-full h-14 border-dashed border-2"
            onClick={addExercise}
          >
            <Plus className="h-5 w-5 mr-2" />
            Adicionar Exercício
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
