"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";

type Experience = {
  id: string;
  company: string;
  role: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
};

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Minimalist form state for new/edit
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    description: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
  });

  const fetchExperiences = () => {
    setLoading(true);
    fetch("/api/cv/experience")
      .then((res) => res.json())
      .then((json) => {
        setExperiences(json.data || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load experiences");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const payload = {
        ...formData,
        endDate: formData.isCurrent ? null : formData.endDate,
      };

      const res = await fetch("/api/cv/experience", {
        method: "POST", // In a real app we'd differentiate POST vs PATCH for edits
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save experience");

      toast.success("Experience added!");
      setIsEditing(false);
      setFormData({ company: "", role: "", description: "", startDate: "", endDate: "", isCurrent: false });
      fetchExperiences();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  // Mock delete since we don't have the DELETE endpoint yet
  const handleDelete = (id: string) => {
    toast.error("Delete endpoint not implemented yet in the mock api! (DEVIL Challenge)");
  };

  if (loading && experiences.length === 0) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex justify-between items-center bg-transparent">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Experience</h1>
          <p className="text-muted-foreground">Manage your work history.</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Experience
          </Button>
        )}
      </div>

      {isEditing && (
        <Card className="border-primary bg-primary/5">
          <form onSubmit={handleSave}>
            <CardHeader>
              <CardTitle>Add New Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" name="company" value={formData.company} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role / Job Title</Label>
                  <Input id="role" name="role" value={formData.role} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label className="flex gap-4 items-center">
                    <Input id="isCurrent" name="isCurrent" type="checkbox" checked={formData.isCurrent} onChange={handleChange} className="w-4 h-4 mt-1" />
                    I currently work here
                  </Label>
                </div>
                {!formData.isCurrent && (
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required={!formData.isCurrent} />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description & Achievements</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-primary/10 pt-4 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {experiences.length === 0 && !isEditing ? (
          <div className="text-center p-12 border border-dashed rounded-lg bg-muted/20">
            <h3 className="text-lg font-medium">No experiences added yet</h3>
            <p className="text-muted-foreground mt-1 mb-4">Add your first work experience to get started.</p>
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Add Experience
            </Button>
          </div>
        ) : (
          experiences.map((exp) => (
            <Card key={exp.id}>
              <CardContent className="p-6 flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">{exp.role}</h3>
                  <div className="text-primary font-medium">{exp.company}</div>
                  <div className="text-sm text-muted-foreground">
                    {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}
                  </div>
                  {exp.description && (
                    <p className="text-sm mt-3 text-muted-foreground whitespace-pre-wrap">{exp.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => toast.info("Edit mode not implemented in mock")}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => handleDelete(exp.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
