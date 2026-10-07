// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Package, DollarSign } from "lucide-react";
import { useParams } from "next/navigation";

const categories = ["producto", "servicio", "curso", "suscripcion", "otro"] as const;
const currencies = ["USD", "EUR", "MXN", "ARS", "COP", "CLP", "PEN"] as const;

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  benefits: string[];
  features: string[];
  status: string;
}

export default function ProductsPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "producto",
    price: 0,
    currency: "USD",
    benefits: "",
    features: "",
    status: "active",
  });

  useEffect(() => {
    fetch(`/api/companies/${companyId}/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products);
        setLoading(false);
      });
  }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      price: Number(form.price),
      benefits: form.benefits.split("\n").filter(Boolean),
      features: form.features.split("\n").filter(Boolean),
    };
    const method = editing ? "PATCH" : "POST";
    const url = editing ? `/api/companies/${companyId}/products/${editing.id}` : `/api/companies/${companyId}/products`;
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) {
      const result = await res.json();
      if (editing) setProducts(products.map(p => p.id === editing.id ? result.product : p));
      else setProducts([...products, result.product]);
      setForm({ name: "", description: "", category: "producto", price: 0, currency: "USD", benefits: "", features: "", status: "active" });
      setShowForm(false);
      setEditing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    await fetch(`/api/companies/${companyId}/products/${id}`, { method: "DELETE" });
    setProducts(products.filter(p => p.id !== id));
  };

  if (loading) return <div className="animate-spin h-8 w-8 border-b-2 border-primary" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Package className="text-primary" /> Productos y Servicios</h1>
          <p className="text-muted-foreground">Catálogo de productos y servicios de la empresa</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ name: "", description: "", category: "producto", price: 0, currency: "USD", benefits: "", features: "", status: "active" }); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" />Nuevo Producto
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary">
          <CardHeader><CardTitle>{editing ? "Editar" : "Crear"} Producto</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="name">Nombre *</Label><Input id="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
                <div className="space-y-2"><Label htmlFor="category">Categoría *</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({...form, category: v as any})}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label htmlFor="price">Precio</Label><Input id="price" type="number" value={form.price} onChange={(e) => setForm({...form, price: Number(e.target.value)})} /></div>
                <div className="space-y-2"><Label htmlFor="currency">Moneda</Label>
                  <Select value={form.currency} onValueChange={(v) => setForm({...form, currency: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label htmlFor="description">Descripción</Label><Input id="description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
              <div className="space-y-2"><Label>Beneficios (uno por línea)</Label><textarea className="w-full min-h-[80px] p-3 border rounded" value={form.benefits} onChange={(e) => setForm({...form, benefits: e.target.value})} /></div>
              <div className="space-y-2"><Label>Características (uno por línea)</Label><textarea className="w-full min-h-[80px] p-3 border rounded" value={form.features} onChange={(e) => setForm({...form, features: e.target.value})} /></div>
              <div className="flex gap-2">
                <Button type="submit">{editing ? "Actualizar" : "Crear"}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); setForm({ name: "", description: "", category: "producto", price: 0, currency: "USD", benefits: "", features: "", status: "active" }); }}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(product); setForm({ name: product.name, description: product.description, category: product.category, price: product.price, currency: product.currency, benefits: product.benefits.join("\n"), features: product.features.join("\n"), status: product.status }); setShowForm(true); }}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{product.description}</p>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">{product.category}</Badge>
                <Badge variant="secondary">{product.currency} {product.price.toLocaleString()}</Badge>
                <Badge variant="outline">{product.status}</Badge>
              </div>
              {product.benefits.length > 0 && (
                <div className="text-xs text-muted-foreground">Beneficios: {product.benefits.slice(0, 3).join(", ")}{product.benefits.length > 3 ? "..." : ""}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}