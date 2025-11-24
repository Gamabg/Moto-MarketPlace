import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { MotorcycleForm } from "./MotorcycleForm";
import { MotorcycleList } from "./MotorcycleList";

export const MotorcyclesTab = () => {
  const [motorcycles, setMotorcycles] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMotorcycle, setEditingMotorcycle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchMotorcycles(), fetchBrands()]);
    setLoading(false);
  };

  const fetchMotorcycles = async () => {
    const { data, error } = await supabase
      .from("motorcycles")
      .select(`
        *,
        brand:brands(name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar motos");
      return;
    }
    setMotorcycles(data || []);
  };

  const fetchBrands = async () => {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Erro ao carregar marcas");
      return;
    }
    setBrands(data || []);
  };

  const handleSave = async (motorcycleData: any) => {
    try {
      if (editingMotorcycle) {
        const { error } = await supabase
          .from("motorcycles")
          .update(motorcycleData)
          .eq("id", editingMotorcycle.id);

        if (error) throw error;
        toast.success("Moto atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from("motorcycles")
          .insert([motorcycleData]);

        if (error) throw error;
        toast.success("Moto adicionada com sucesso!");
      }

      setShowForm(false);
      setEditingMotorcycle(null);
      fetchMotorcycles();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar moto");
    }
  };

  const handleEdit = (motorcycle: any) => {
    setEditingMotorcycle(motorcycle);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta moto?")) return;

    const { error } = await supabase
      .from("motorcycles")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao excluir moto");
      return;
    }

    toast.success("Moto excluída com sucesso!");
    fetchMotorcycles();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMotorcycle(null);
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
      {!showForm ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Gerenciar Motos</h2>
              <p className="text-muted-foreground">Adicione, edite ou remova motos do catálogo</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="gap-2 bg-gradient-hero hover:opacity-90">
              <Plus className="w-4 h-4" />
              Nova Moto
            </Button>
          </div>
          <MotorcycleList
            motorcycles={motorcycles}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      ) : (
        <MotorcycleForm
          motorcycle={editingMotorcycle}
          brands={brands}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};
