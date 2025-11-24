import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

export const BrandsTab = () => {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", logo_url: "" });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Erro ao carregar marcas");
      return;
    }
    setBrands(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingBrand) {
        const { error } = await supabase
          .from("brands")
          .update(formData)
          .eq("id", editingBrand.id);

        if (error) throw error;
        toast.success("Marca atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from("brands")
          .insert([formData]);

        if (error) throw error;
        toast.success("Marca adicionada com sucesso!");
      }

      setFormData({ name: "", logo_url: "" });
      setEditingBrand(null);
      fetchBrands();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar marca");
    }
  };

  const handleEdit = (brand: any) => {
    setEditingBrand(brand);
    setFormData({ name: brand.name, logo_url: brand.logo_url || "" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza? Isso também excluirá todas as motos desta marca.")) return;

    const { error } = await supabase
      .from("brands")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao excluir marca");
      return;
    }

    toast.success("Marca excluída com sucesso!");
    fetchBrands();
  };

  const handleCancel = () => {
    setEditingBrand(null);
    setFormData({ name: "", logo_url: "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>{editingBrand ? "Editar Marca" : "Nova Marca"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Marca *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo_url">URL do Logo</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="bg-gradient-hero hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                {editingBrand ? "Atualizar" : "Adicionar"}
              </Button>
              {editingBrand && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Logo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell className="font-medium">{brand.name}</TableCell>
                <TableCell>
                  {brand.logo_url ? (
                    <img src={brand.logo_url} alt={brand.name} className="h-8 w-auto" />
                  ) : (
                    <span className="text-muted-foreground text-sm">Sem logo</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(brand)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(brand.id)}
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
    </div>
  );
};
