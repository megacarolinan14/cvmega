"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadFileToFirebase } from "@/lib/upload"; // We'll create this utility next
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";

export default function ProfileSettingsPage() {
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
    fetch("/api/cv/profile")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setFormData({
            username: json.data.username || "",
            headline: json.data.headline || "",
            bio: json.data.bio || "",
            location: json.data.location || "",
            phone: json.data.phone || "",
            photoUrl: json.data.photoUrl || "",
            themePrimaryColor: json.data.themePrimaryColor || "0 84.2% 60.2%"
          });
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load profile");
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let finalPhotoUrl = formData.photoUrl;

    try {
      if (photoFile) {
        toast.info("Uploading photo...");
        // upload to 'avatars/{timestamp}-{filename}' path
        finalPhotoUrl = await uploadFileToFirebase(photoFile, `avatars/${Date.now()}-${photoFile.name}`);
      }

      const res = await fetch("/api/cv/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, photoUrl: finalPhotoUrl }),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      setFormData((prev) => ({ ...prev, photoUrl: finalPhotoUrl }));
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
