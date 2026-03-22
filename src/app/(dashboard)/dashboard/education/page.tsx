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
import { Loader2, Plus, Trash2, Pencil, GraduationCap } from "lucide-react";
import { systemLog } from "@/lib/logger";

type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string | null;
  gpa: string | null;
  isCurrent: boolean;
};

export default function EducationPage() {
  const { user } = useAuth();
  const [educations, setEducations] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    institution: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    gpa: "",
    isCurrent: false,
  });

  const fetchEducation = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, "profiles", user.uid, "educations"), orderBy("startDate", "desc"));
      const snapshot = await getDocs(q);
      const data: Education[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Education));
      setEducations(data);
    } catch (error) {
      toast.error("Failed to load education");
      systemLog("error", "Education fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducation();
  }, [user]);

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
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        ...formData,
        endDate: formData.isCurrent ? null : formData.endDate,
        updatedAt: new Date().toISOString()
      };
      await addDoc(collection(db, "profiles", user.uid, "educations"), payload);
      toast.success("Education added!");
      setIsEditing(false);
      setFormData({ institution: "", degree: "", field: "", startDate: "", endDate: "", gpa: "", isCurrent: false });
      fetchEducation();
      systemLog("info", "User added education entry");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
      systemLog("error", "Failed to add education", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Delete this education entry?")) return;
    try {
      await deleteDoc(doc(db, "profiles", user.uid, "educations", id));
      toast.success("Education deleted");
      setEducations(prev => prev.filter(edu => edu.id !== id));
      systemLog("info", "User deleted education entry");
    } catch (error) {
      toast.error("Failed to delete education");
    }
  };

  if (loading && educations.length === 0) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Education</h1>
          <p className="text-muted-foreground">Highlight your academic background.</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Education
          </Button>
        )}
      </div>

      {isEditing && (
        <Card className="border-primary bg-primary/5">
          <form onSubmit={handleSave}>
            <CardHeader>
              <CardTitle>Add Academic History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution / University</Label>
                  <Input id="institution" name="institution" value={formData.institution} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="degree">Degree (e.g. Bachelor of Science)</Label>
                  <Input id="degree" name="degree" value={formData.degree} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="field">Field of Study</Label>
                  <Input id="field" name="field" value={formData.field} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gpa">GPA / Grade (Optional)</Label>
                  <Input id="gpa" name="gpa" value={formData.gpa} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label className="flex gap-4 items-center">
                    <Input id="isCurrent" name="isCurrent" type="checkbox" checked={formData.isCurrent} onChange={handleChange} className="w-4 h-4 mt-1" />
                    I am currently studying here
                  </Label>
                </div>
                {!formData.isCurrent && (
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date / Expected</Label>
                    <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required={!formData.isCurrent} />
                  </div>
                )}
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
        {educations.length === 0 && !isEditing ? (
          <div className="text-center p-12 border border-dashed rounded-lg bg-muted/20">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No education added yet</h3>
            <p className="text-muted-foreground mt-1 mb-4">Add your university or school details.</p>
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Add Education
            </Button>
          </div>
        ) : (
          educations.map((edu) => (
            <Card key={edu.id}>
              <CardContent className="p-6 flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">{edu.degree} in {edu.field}</h3>
                  <div className="text-primary font-medium">{edu.institution}</div>
                  <div className="text-sm text-muted-foreground">
                    {edu.startDate} - {edu.isCurrent ? "Present" : edu.endDate}
                    {edu.gpa && <span className="ml-2 pl-2 border-l border-muted-foreground/30">GPA: {edu.gpa}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => handleDelete(edu.id)}>
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
