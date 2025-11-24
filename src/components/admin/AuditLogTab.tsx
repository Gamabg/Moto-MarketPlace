import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const AuditLogTab = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      toast.error("Erro ao carregar histórico");
      return;
    }
    setLogs(data || []);
    setLoading(false);
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, any> = {
      INSERT: "default",
      UPDATE: "secondary",
      DELETE: "destructive",
    };
    return (
      <Badge variant={variants[action] || "default"}>
        {action === "INSERT" ? "Criado" : action === "UPDATE" ? "Atualizado" : "Excluído"}
      </Badge>
    );
  };

  const getTableName = (tableName: string) => {
    const names: Record<string, string> = {
      motorcycles: "Motos",
      brands: "Marcas",
    };
    return names[tableName] || tableName;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum registro no histórico
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Histórico de Alterações</h2>
        <p className="text-muted-foreground">
          Todas as mudanças no sistema são registradas automaticamente
        </p>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Tabela</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm">
                  {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                </TableCell>
                <TableCell>{getActionBadge(log.action)}</TableCell>
                <TableCell>{getTableName(log.table_name)}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                  {log.action === "INSERT" && log.new_data && (
                    <span>Novo registro criado</span>
                  )}
                  {log.action === "UPDATE" && log.old_data && log.new_data && (
                    <span>Registro modificado</span>
                  )}
                  {log.action === "DELETE" && log.old_data && (
                    <span>Registro excluído</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
