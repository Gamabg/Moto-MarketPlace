import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";

interface MotorcycleListProps {
  motorcycles: any[];
  onEdit: (motorcycle: any) => void;
  onDelete: (id: string) => void;
}

export const MotorcycleList = ({ motorcycles, onEdit, onDelete }: MotorcycleListProps) => {
  if (motorcycles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhuma moto cadastrada ainda
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Marca/Modelo</TableHead>
            <TableHead>Ano</TableHead>
            <TableHead>Cilindrada</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {motorcycles.map((motorcycle) => (
            <TableRow key={motorcycle.id}>
              <TableCell className="font-medium">
                {motorcycle.brand.name} {motorcycle.model}
              </TableCell>
              <TableCell>{motorcycle.year}</TableCell>
              <TableCell>{motorcycle.displacement}cc</TableCell>
              <TableCell>
                R$ {motorcycle.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell>
                <Badge variant={motorcycle.is_available ? "default" : "secondary"}>
                  {motorcycle.is_available ? "Disponível" : "Indisponível"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(motorcycle)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(motorcycle.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
