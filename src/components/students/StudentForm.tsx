import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Student {
  id: string;
  nome: string;
  matricula: string;
  email: string;
}

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Student, "id">) => void;
  student?: Student | null;
  loading?: boolean;
}

export const StudentForm = ({
  open,
  onClose,
  onSubmit,
  student,
  loading = false,
}: StudentFormProps) => {
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (student) {
      setNome(student.nome);
      setMatricula(student.matricula);
      setEmail(student.email);
    } else {
      setNome("");
      setMatricula("");
      setEmail("");
    }
  }, [student, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ nome, matricula, email });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {student ? "Editar Aluno" : "Novo Aluno"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                disabled={loading}
                placeholder="João da Silva"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula</Label>
              <Input
                id="matricula"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                required
                disabled={loading}
                placeholder="202401234"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="joao@email.com"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
