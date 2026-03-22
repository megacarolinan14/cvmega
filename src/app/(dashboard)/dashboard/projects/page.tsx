"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, addDoc, deleteDoc, query, orderBy, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Layers, ExternalLink, Github, Pencil } from "lucide-react";
import { systemLog } from "@/lib/logger";

type Project = {
  id: string;
  title: string;
  description: string;
  url: string | null;
  githubUrl: string | null;
  imageUrl: string | null;
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    githubUrl: "",
    imageUrl: "",
  });

  const fetchProjects = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, "profiles", user.uid, "projects"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data: Project[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Project));
      setProjects(data);
    } catch (error) {
      toast.error("Failed to load projects");
      systemLog("error", "Projects fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (project: Project) => {
    setFormData({
      title: project.title,
      description: project.description,
      url: project.url || "",
      githubUrl: project.githubUrl || "",
      imageUrl: project.imageUrl || "",
    });
    setEditingId(project.id);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        ...formData,
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        await updateDoc(doc(db, "profiles", user.uid, "projects", editingId), payload);
        toast.success("Project updated!");
      } else {
        await addDoc(collection(db, "profiles", user.uid, "projects"), {
          ...payload,
          createdAt: new Date().toISOString()
        });
        toast.success("Project added!");
      }

      setIsEditing(false);
      setEditingId(null);
      setFormData({ title: "", description: "", url: "", githubUrl: "", imageUrl: "" });
      fetchProjects();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Delete this project?")) return;
    try {
      await deleteDoc(doc(db, "profiles", user.uid, "projects", id));
      toast.success("Project deleted");
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  if (loading && projects.length === 0) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Portfolio & Projects</h1>
          <p className="text-muted-foreground">Showcase your best work and case studies.</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Project
          </Button>
        )}
      </div>

      {isEditing && (
        <Card className="border-primary bg-primary/5 shadow-sm">
          <form onSubmit={handleSave}>
            <CardHeader>
              <CardTitle>{editingId ? "Edit Project Showcase" : "Create Project Showcase"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. CV-Mega AI Platform" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Live URL (Optional)</Label>
                  <Input id="url" name="url" value={formData.url} onChange={handleChange} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub / Source URL (Optional)</Label>
                  <Input id="githubUrl" name="githubUrl" value={formData.githubUrl} onChange={handleChange} placeholder="https://github.com/..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="imageUrl">Cover Image URL (Optional)</Label>
                  <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." />
                  <p className="text-xs text-muted-foreground">For now, paste an external image link. File upload coming soon.</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="What did you build and why?" required />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-primary/10 pt-4 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Project
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {projects.length === 0 && !isEditing && (
          <div className="col-span-1 md:col-span-2 text-center p-12 border border-dashed rounded-lg bg-muted/20">
            <Layers className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No projects added yet</h3>
            <p className="text-muted-foreground mt-1 mb-4">A portfolio speaks louder than words.</p>
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Add an impressive project
            </Button>
          </div>
        )}
        
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
            {project.imageUrl ? (
              <div 
                className="h-48 w-full bg-cover bg-center border-b" 
                style={{ backgroundImage: `url(${project.imageUrl})` }}
              />
            ) : (
              <div className="h-48 w-full bg-muted flex items-center justify-center border-b">
                <Layers className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            <CardContent className="p-6 flex-grow space-y-3">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-xl">{project.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
            </CardContent>
            <CardFooter className="p-6 pt-0 flex justify-between items-center bg-transparent">
               <div className="flex gap-2">
                 {project.url && (
                   <a href={project.url} target="_blank" rel="noreferrer" className="text-xs font-medium flex items-center text-primary hover:underline">
                     <ExternalLink className="h-3 w-3 mr-1" /> Live
                   </a>
                 )}
                 {project.githubUrl && (
                   <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-xs font-medium flex items-center text-muted-foreground hover:text-primary transition-colors">
                     <Github className="h-3 w-3 mr-1" /> Source
                   </a>
                 )}
               </div>
               <div className="flex gap-2">
                 <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-8 w-8" onClick={() => handleEdit(project)}>
                   <Pencil className="h-4 w-4" />
                 </Button>
                 <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 h-8 w-8" onClick={() => handleDelete(project.id)}>
                   <Trash2 className="h-4 w-4" />
                 </Button>
               </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
