"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, addDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Trophy, ExternalLink } from "lucide-react";
import { systemLog } from "@/lib/logger";

type Certification = {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl: string | null;
};

export default function CertificationsPage() {
  const { user } = useAuth();
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    issuer: "",
    issueDate: "",
    credentialUrl: "",
  });

  const fetchCerts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, "profiles", user.uid, "certifications"), orderBy("issueDate", "desc"));
      const snapshot = await getDocs(q);
      const data: Certification[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Certification));
      setCerts(data);
    } catch (error) {
      toast.error("Failed to load certifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "profiles", user.uid, "certifications"), { ...formData });
      toast.success("Certification added!");
      setFormData({ name: "", issuer: "", issueDate: "", credentialUrl: "" });
      fetchCerts();
      systemLog("info", "User added certification");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "profiles", user.uid, "certifications", id));
      setCerts(prev => prev.filter(c => c.id !== id));
      toast.success("Certification removed");
    } catch (error) {
      toast.error("Failed to delete certification");
    }
  };

  if (loading && certs.length === 0) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Certifications & Awards</h1>
        <p className="text-muted-foreground">List your achievements and credentials to validate your expertise.</p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <form onSubmit={handleAddCert} className="flex flex-col md:flex-row gap-4 items-end flex-wrap">
            <div className="space-y-2 flex-grow min-w-[200px]">
              <Label>Certificate Name</Label>
              <Input name="name" placeholder="e.g. AWS Solutions Architect" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2 flex-grow min-w-[150px]">
              <Label>Issuing Organization</Label>
              <Input name="issuer" placeholder="e.g. Amazon Web Services" value={formData.issuer} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label>Issue Date</Label>
              <Input name="issueDate" type="date" value={formData.issueDate} onChange={handleChange} required />
            </div>
            <div className="space-y-2 flex-grow min-w-[200px]">
              <Label>Credential URL (Optional)</Label>
              <Input name="credentialUrl" placeholder="https://..." value={formData.credentialUrl} onChange={handleChange} />
            </div>
            <Button type="submit" disabled={saving || !formData.name} className="mt-4 md:mt-0">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />} Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4 mt-8">
        {certs.length === 0 ? (
           <div className="text-center p-12 border border-dashed rounded-lg bg-muted/20">
             <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
             <h3 className="text-lg font-medium">No certifications added</h3>
             <p className="text-muted-foreground mt-1">Stand out by proving your knowledge.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certs.map(cert => (
              <Card key={cert.id} className="shadow-sm hover:border-primary/50 transition-colors">
                 <CardContent className="p-4 flex justify-between items-start">
                   <div className="space-y-1">
                      <h4 className="font-bold text-lg">{cert.name}</h4>
                      <p className="text-primary text-sm font-medium">{cert.issuer}</p>
                      <p className="text-xs text-muted-foreground">Issued: {cert.issueDate}</p>
                      {cert.credentialUrl && (
                         <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs text-blue-500 hover:underline mt-2">
                           <ExternalLink className="w-3 h-3 mr-1" /> View Verification
                         </a>
                      )}
                   </div>
                   <Button variant="ghost" size="icon" onClick={() => handleDelete(cert.id)} className="h-8 w-8 text-muted-foreground hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                   </Button>
                 </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
