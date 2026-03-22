"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, addDoc, deleteDoc, query, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Share2, Pencil, Instagram, Linkedin, Github, Twitter, Globe, Link as LinkIcon } from "lucide-react";

type SocialLink = {
  id: string;
  platform: string;
  url: string;
};

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: Instagram },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin },
  { id: "github", name: "GitHub", icon: Github },
  { id: "twitter", name: "Twitter / X", icon: Twitter },
  { id: "portfolio", name: "Portfolio / Website", icon: Globe },
  { id: "other", name: "Other", icon: LinkIcon },
];

export default function SocialMediaPage() {
  const { user } = useAuth();
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [platform, setPlatform] = useState("instagram");
  const [url, setUrl] = useState("");

  const fetchSocials = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, "profiles", user.uid, "socials"));
      const snapshot = await getDocs(q);
      const data: SocialLink[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as SocialLink));
      setSocials(data);
    } catch (error) {
      toast.error("Failed to load social links");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocials();
  }, [user]);

  const handleEdit = (social: SocialLink) => {
    setPlatform(social.platform);
    setUrl(social.url);
    setEditingId(social.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !url) return;
    setSaving(true);
    try {
      const payload = {
        platform,
        url,
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        await updateDoc(doc(db, "profiles", user.uid, "socials", editingId), payload);
        toast.success("Social link updated!");
      } else {
        await addDoc(collection(db, "profiles", user.uid, "socials"), {
          ...payload,
          createdAt: new Date().toISOString()
        });
        toast.success("Social link added!");
      }

      setUrl("");
      setEditingId(null);
      fetchSocials();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "profiles", user.uid, "socials", id));
      setSocials(prev => prev.filter(s => s.id !== id));
      toast.success("Social link removed");
    } catch (error) {
      toast.error("Failed to delete social link");
    }
  };

  const getPlatformIcon = (platformId: string) => {
    const p = PLATFORMS.find(item => item.id === platformId);
    if (!p) return LinkIcon;
    return p.icon;
  };

  if (loading && socials.length === 0) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Social Media</h1>
        <p className="text-muted-foreground">Connect your professional profiles and social accounts.</p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <form onSubmit={handleSaveSocial} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 w-full md:w-48">
              <Label>Platform</Label>
              <div className="border rounded-md px-3 py-2 bg-background">
                <select className="w-full bg-transparent outline-none text-sm" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                   {PLATFORMS.map(p => (
                     <option key={p.id} value={p.id}>{p.name}</option>
                   ))}
                </select>
              </div>
            </div>

            <div className="space-y-2 flex-grow">
              <Label>Profile URL</Label>
              <Input placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} required type="url" />
            </div>

            <Button type="submit" disabled={saving || !url} className="w-full md:w-auto mt-4 md:mt-0 px-8">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update" : <><Plus className="h-4 w-4 mr-2" /> Add</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4 mt-8">
        {socials.length === 0 ? (
           <div className="text-center p-12 border border-dashed rounded-lg bg-muted/20">
             <Share2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
             <h3 className="text-lg font-medium">No social links yet</h3>
             <p className="text-muted-foreground mt-1">Add your LinkedIn, Github or Instagram to get connected.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {socials.map(social => {
              const Icon = getPlatformIcon(social.platform);
              const platformName = PLATFORMS.find(p => p.id === social.platform)?.name || social.platform;
              return (
                <div key={social.id} className="flex justify-between items-center p-4 bg-card border rounded-2xl shadow-sm group hover:border-primary/30 transition-all">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden max-w-[150px] sm:max-w-none">
                        <div className="font-bold text-sm">{platformName}</div>
                        <div className="text-xs text-muted-foreground truncate">{social.url}</div>
                      </div>
                   </div>
                   <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(social)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(social.id)} className="h-8 w-8 text-muted-foreground hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                   </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
