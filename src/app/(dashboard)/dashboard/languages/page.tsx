"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, addDoc, deleteDoc, query, orderBy, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Languages, Pencil } from "lucide-react";
import { systemLog } from "@/lib/logger";

type Language = {
  id: string;
  name: string;
  proficiency: "NATIVE" | "FLUENT" | "ADVANCED" | "INTERMEDIATE" | "BASIC";
};

export default function LanguagesPage() {
  const { user } = useAuth();
  const [langs, setLangs] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [proficiency, setProficiency] = useState("FLUENT");

  const fetchLangs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, "profiles", user.uid, "languages"));
      const snapshot = await getDocs(q);
      const data: Language[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Language));
      setLangs(data);
    } catch (error) {
      toast.error("Failed to load languages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLangs();
  }, [user]);

  const handleEdit = (lang: Language) => {
    setName(lang.name);
    setProficiency(lang.proficiency);
    setEditingId(lang.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveLang = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name) return;
    setSaving(true);
    try {
      const payload = {
        name,
        proficiency,
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        await updateDoc(doc(db, "profiles", user.uid, "languages", editingId), payload);
        toast.success("Language updated!");
      } else {
        await addDoc(collection(db, "profiles", user.uid, "languages"), {
          ...payload,
          createdAt: new Date().toISOString()
        });
        toast.success("Language added!");
      }

      setName("");
      setEditingId(null);
      fetchLangs();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "profiles", user.uid, "languages", id));
      setLangs(prev => prev.filter(l => l.id !== id));
      toast.success("Language removed");
    } catch (error) {
      toast.error("Failed to delete language");
    }
  };

  if (loading && langs.length === 0) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Languages</h1>
        <p className="text-muted-foreground">What languages do you speak? Expand your global reach.</p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <form onSubmit={handleSaveLang} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 flex-grow">
              <Label>{editingId ? "Edit Language Name" : "Language Name"}</Label>
              <Input placeholder="e.g. English, Indonesian, Japanese..." value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            
            <div className="space-y-2 w-full md:w-48">
              <Label>Proficiency Level</Label>
              <div className="border rounded-md px-3 py-2 bg-background">
                <select className="w-full bg-transparent outline-none text-sm" value={proficiency} onChange={(e) => setProficiency(e.target.value)}>
                   <option value="NATIVE">Native / Bilingual</option>
                   <option value="FLUENT">Fluent</option>
                   <option value="ADVANCED">Advanced / Professional</option>
                   <option value="INTERMEDIATE">Intermediate</option>
                   <option value="BASIC">Basic</option>
                </select>
              </div>
            </div>

            <Button type="submit" disabled={saving || !name} className="w-full md:w-auto mt-4 md:mt-0">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />} Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4 mt-8">
        {langs.length === 0 ? (
           <div className="text-center p-12 border border-dashed rounded-lg bg-muted/20">
             <Languages className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
             <h3 className="text-lg font-medium">No languages added</h3>
             <p className="text-muted-foreground mt-1">Polylingual profiles attract more recruiters.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {langs.map(lang => (
              <div key={lang.id} className="flex justify-between items-center p-4 bg-card border rounded-lg shadow-sm">
                 <div>
                    <div className="font-bold text-lg">{lang.name}</div>
                    <div className="text-sm text-primary font-medium mt-1">{lang.proficiency}</div>
                 </div>
                 <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(lang)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(lang.id)} className="h-8 w-8 text-muted-foreground hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
