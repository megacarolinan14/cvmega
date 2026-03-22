"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, addDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Cpu } from "lucide-react";
import { systemLog } from "@/lib/logger";

type Skill = {
  id: string;
  name: string;
  proficiency: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  category: "Core" | "Software" | "Soft Skill" | "Tools";
};

const PROFICIENCY_COLORS = {
  BEGINNER: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  INTERMEDIATE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  ADVANCED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  EXPERT: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};

export default function SkillsPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState("");
  const [proficiency, setProficiency] = useState("INTERMEDIATE");
  const [category, setCategory] = useState("Core");

  const fetchSkills = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, "profiles", user.uid, "skills"), orderBy("category"));
      const snapshot = await getDocs(q);
      const data: Skill[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Skill));
      setSkills(data);
    } catch (error) {
      toast.error("Failed to load skills");
      systemLog("error", "Skills fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [user]);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "profiles", user.uid, "skills"), {
        name,
        proficiency,
        category,
        createdAt: new Date().toISOString()
      });
      toast.success("Skill added!");
      setName("");
      fetchSkills();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "profiles", user.uid, "skills", id));
      setSkills(prev => prev.filter(s => s.id !== id));
      toast.success("Skill removed");
    } catch (error) {
      toast.error("Failed to delete skill");
    }
  };

  if (loading && skills.length === 0) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  // Group skills by category for display
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Skills & Capabilities</h1>
        <p className="text-muted-foreground">List your technical stack and core competencies.</p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <form onSubmit={handleAddSkill} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 flex-grow w-full md:w-auto">
              <Label>Skill Name</Label>
              <Input placeholder="e.g. React.js, Python, Leadership" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            
            <div className="space-y-2 w-full md:w-48">
              <Label>Category</Label>
              <div className="border rounded-md px-3 py-2 bg-background">
                <select className="w-full bg-transparent outline-none text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
                   <option value="Core">Core Strength</option>
                   <option value="Software">Frontend / Backend</option>
                   <option value="Tools">Dev Tools / OS</option>
                   <option value="Soft Skill">Soft Skill</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 w-full md:w-48">
              <Label>Proficiency</Label>
              <div className="border rounded-md px-3 py-2 bg-background">
                <select className="w-full bg-transparent outline-none text-sm" value={proficiency} onChange={(e) => setProficiency(e.target.value)}>
                   <option value="BEGINNER">Beginner</option>
                   <option value="INTERMEDIATE">Intermediate</option>
                   <option value="ADVANCED">Advanced</option>
                   <option value="EXPERT">Expert</option>
                </select>
              </div>
            </div>

            <Button type="submit" disabled={saving || !name} className="w-full md:w-auto mt-4 md:mt-0">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />} Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-8 mt-8">
        {Object.entries(groupedSkills).length === 0 ? (
           <div className="text-center p-12 border border-dashed rounded-lg bg-muted/20">
             <Cpu className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
             <h3 className="text-lg font-medium">No skills mapped yet</h3>
             <p className="text-muted-foreground mt-1">Start adding your core skills above.</p>
           </div>
        ) : (
          Object.entries(groupedSkills).map(([cat, catskills]) => (
            <div key={cat} className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">{cat}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {catskills.map(skill => (
                  <div key={skill.id} className="flex justify-between items-center p-3 bg-card border rounded-lg shadow-sm">
                    <div className="space-y-1">
                      <div className="font-semibold">{skill.name}</div>
                      <div className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full inline-block ${PROFICIENCY_COLORS[skill.proficiency as keyof typeof PROFICIENCY_COLORS]}`}>
                        {skill.proficiency}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(skill.id)} className="h-8 w-8 text-muted-foreground hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
