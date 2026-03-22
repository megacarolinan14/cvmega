"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadFileToFirebase } from "@/lib/upload";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    username: "",
    headline: "",
    bio: "",
    location: "",
    phone: "",
    photoUrl: "",
    themePrimaryColor: "0 84.2% 60.2%"
  });

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "profiles", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            username: data.username || "",
            headline: data.headline || "",
            bio: data.bio || "",
            location: data.location || "",
            phone: data.phone || "",
            photoUrl: data.photoUrl || "",
            themePrimaryColor: data.themePrimaryColor || "0 84.2% 60.2%"
          });
        }
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    let finalPhotoUrl = formData.photoUrl;

    try {
      if (photoFile) {
        toast.info("Uploading photo...");
        finalPhotoUrl = await uploadFileToFirebase(photoFile, `avatars/${user.uid}-${Date.now()}`);
      }

      // Slugify username: lowercase, replace spaces with -, remove special chars
      const sanitizedUsername = formData.username
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      await setDoc(doc(db, "profiles", user.uid), {
        ...formData,
        username: sanitizedUsername,
        photoUrl: finalPhotoUrl,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setFormData((prev) => ({ 
        ...prev, 
        username: sanitizedUsername,
        photoUrl: finalPhotoUrl 
      }));
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your public information and theme.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>This will be displayed on your public CV.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="h-24 w-24 rounded-full border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                 {photoFile ? (
                    <img src={URL.createObjectURL(photoFile)} className="w-full h-full object-cover" />
                 ) : formData.photoUrl ? (
                    <img src={formData.photoUrl} className="w-full h-full object-cover" />
                 ) : (
                    <UploadCloud className="h-8 w-8 text-muted-foreground" />
                 )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="photo">Profile Photo</Label>
                <Input 
                  id="photo" 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="max-w-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username (Public URL Slug)</Label>
                <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
                <p className="text-xs font-mono text-muted-foreground bg-muted p-2 rounded border border-dashed">
                  Live Preview: <span className="text-primary font-bold">cvmega.vercel.app/{formData.username.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || "your-slug"}</span>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="headline">Headline / Job Title</Label>
                <Input id="headline" name="headline" value={formData.headline} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" value={formData.location} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={5} />
            </div>
            
            <div className="space-y-2 pt-4 border-t" id="theme">
              <Label htmlFor="themePrimaryColor">Theme Primary Color (HSL format)</Label>
              <Input 
                id="themePrimaryColor" 
                name="themePrimaryColor" 
                value={formData.themePrimaryColor} 
                onChange={handleChange} 
                placeholder="e.g. 0 84.2% 60.2%" 
              />
              <p className="text-xs text-muted-foreground">Change the primary color of your public CV natively using HSL values.</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
