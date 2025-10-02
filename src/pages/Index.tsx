import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { StudentList } from "@/components/students/StudentList";
import { StudentForm } from "@/components/students/StudentForm";
import { useToast } from "@/hooks/use-toast";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { GraduationCap, LogOut, Plus } from "lucide-react";

interface Student {
  id: string;
  nome: string;
  matricula: string;
  email: string;
  user_id: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar alunos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleSubmit = async (data: Omit<Student, "id" | "user_id">) => {
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Usuário não autenticado");

      if (editingStudent) {
        const { error } = await supabase
          .from("students")
          .update(data)
          .eq("id", editingStudent.id);

        if (error) throw error;

        toast({
          title: "Aluno atualizado!",
          description: "Os dados foram salvos com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from("students")
          .insert([{ ...data, user_id: user.id }]);

        if (error) throw error;

        toast({
          title: "Aluno cadastrado!",
          description: "O aluno foi adicionado com sucesso.",
        });
      }

      setFormOpen(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este aluno?")) return;

    try {
      const { error } = await supabase.from("students").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Aluno excluído",
        description: "O aluno foi removido com sucesso.",
      });

      fetchStudents();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormOpen(true);
  };

  const handleNewStudent = () => {
    setEditingStudent(null);
    setFormOpen(true);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-subtle">
        <header className="border-b bg-card shadow-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold">Sistema de Alunos</h1>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Lista de Alunos</h2>
              <p className="text-muted-foreground">
                Gerencie os alunos cadastrados no sistema
              </p>
            </div>
            <Button onClick={handleNewStudent} className="shadow-elegant">
              <Plus className="mr-2 h-4 w-4" />
              Novo Aluno
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <StudentList
              students={students}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </main>

        <StudentForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditingStudent(null);
          }}
          onSubmit={handleSubmit}
          student={editingStudent}
          loading={submitting}
        />
      </div>
    </AuthGuard>
  );
};

export default Index;
