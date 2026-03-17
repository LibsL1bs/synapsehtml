import { useState } from "react";
import { User, Mail, Ruler, Weight, Calendar, Target, Award, Edit2, Save, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  name: string;
  email: string;
  height: string;
  weight: string;
  birthDate: string;
  experienceYears: string;
  competitionCategory: string;
  bestSquat: string;
  bestBench: string;
  bestDeadlift: string;
}

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile>({
    name: "Carlos Silva",
    email: "carlos@email.com",
    height: "178",
    weight: "83",
    birthDate: "1995-06-15",
    experienceYears: "5",
    competitionCategory: "Sub-83kg",
    bestSquat: "190",
    bestBench: "125",
    bestDeadlift: "215",
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const totalBest = parseInt(profile.bestSquat) + parseInt(profile.bestBench) + parseInt(profile.bestDeadlift);

  return (
    <AppLayout>
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-display font-bold text-foreground">
              Meu Perfil
            </h1>
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            )}
          </div>

          {/* Avatar & Name */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <User className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                    className="text-xl font-bold mb-2"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-foreground mb-1">{profile.name}</h2>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                      className="h-8"
                    />
                  ) : (
                    <span>{profile.email}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Best Lifts */}
          <div className="glass-card p-6 mb-6">
            <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Melhores Marcas
            </h3>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">AGACHAMENTO</div>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedProfile.bestSquat}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bestSquat: e.target.value })}
                    className="text-center h-10"
                  />
                ) : (
                  <div className="text-2xl font-bold text-primary">{profile.bestSquat}kg</div>
                )}
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">SUPINO</div>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedProfile.bestBench}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bestBench: e.target.value })}
                    className="text-center h-10"
                  />
                ) : (
                  <div className="text-2xl font-bold text-primary">{profile.bestBench}kg</div>
                )}
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">TERRA</div>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedProfile.bestDeadlift}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bestDeadlift: e.target.value })}
                    className="text-center h-10"
                  />
                ) : (
                  <div className="text-2xl font-bold text-primary">{profile.bestDeadlift}kg</div>
                )}
              </div>
            </div>

            <div className="text-center p-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg border border-primary/30">
              <div className="text-xs text-muted-foreground mb-1">TOTAL</div>
              <div className="text-3xl font-bold gradient-text">{totalBest}kg</div>
            </div>
          </div>

          {/* Physical Info */}
          <div className="glass-card p-6 mb-6">
            <h3 className="font-display font-bold text-foreground mb-4">Dados Físicos</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                  <Ruler className="h-4 w-4" />
                  Altura (cm)
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedProfile.height}
                    onChange={(e) => setEditedProfile({ ...editedProfile, height: e.target.value })}
                  />
                ) : (
                  <div className="font-semibold text-foreground">{profile.height} cm</div>
                )}
              </div>
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                  <Weight className="h-4 w-4" />
                  Peso (kg)
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedProfile.weight}
                    onChange={(e) => setEditedProfile({ ...editedProfile, weight: e.target.value })}
                  />
                ) : (
                  <div className="font-semibold text-foreground">{profile.weight} kg</div>
                )}
              </div>
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  Data de Nascimento
                </label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editedProfile.birthDate}
                    onChange={(e) => setEditedProfile({ ...editedProfile, birthDate: e.target.value })}
                  />
                ) : (
                  <div className="font-semibold text-foreground">
                    {new Date(profile.birthDate).toLocaleDateString("pt-BR")}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4" />
                  Categoria
                </label>
                {isEditing ? (
                  <Input
                    value={editedProfile.competitionCategory}
                    onChange={(e) => setEditedProfile({ ...editedProfile, competitionCategory: e.target.value })}
                  />
                ) : (
                  <div className="font-semibold text-foreground">{profile.competitionCategory}</div>
                )}
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="glass-card p-6">
            <h3 className="font-display font-bold text-foreground mb-4">Experiência</h3>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Anos de Powerlifting
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedProfile.experienceYears}
                  onChange={(e) => setEditedProfile({ ...editedProfile, experienceYears: e.target.value })}
                />
              ) : (
                <div className="font-semibold text-foreground">{profile.experienceYears} anos</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
