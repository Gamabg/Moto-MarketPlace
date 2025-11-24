import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bike } from "lucide-react";

interface MotorcycleCardProps {
  motorcycle: {
    id: string;
    model: string;
    year: number;
    displacement: number;
    price: number;
    color?: string;
    mileage: number;
    image_url?: string;
    brand: {
      name: string;
    };
  };
}

export const MotorcycleCard = ({ motorcycle }: MotorcycleCardProps) => {
  return (
    <Card className="group overflow-hidden border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow">
      <CardHeader className="p-0">
        <div className="relative h-56 overflow-hidden bg-gradient-card">
          {motorcycle.image_url ? (
            <img
              src={motorcycle.image_url}
              alt={`${motorcycle.brand.name} ${motorcycle.model}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Bike className="w-24 h-24 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary/90 backdrop-blur-sm">
              {motorcycle.year}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {motorcycle.brand.name} {motorcycle.model}
          </h3>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{motorcycle.displacement}cc</span>
            {motorcycle.color && (
              <>
                <span>•</span>
                <span>{motorcycle.color}</span>
              </>
            )}
            <span>•</span>
            <span>{motorcycle.mileage.toLocaleString('pt-BR')} km</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <div className="w-full">
          <p className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            R$ {motorcycle.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};
