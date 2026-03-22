"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2, Palette, Type, LayoutTemplate, Save } from "lucide-react";
import { systemLog } from "@/lib/logger";

const FONTS = [
  { id: "inter", name: "Inter (Default, Clean)" },
  { id: "roboto", name: "Roboto (Professional)" },
  { id: "playfair", name: "Playfair Display (Elegant Serif)" },
  { id: "fira-code", name: "Fira Code (Developer Mono)" }
];

const LAYOUTS = [
  { id: "classic", name: "Classic Top-Down" },
  { id: "modern-sidebar", name: "Modern with Sidebar" },
  { id: "minimalist", name: "Minimalist Grid" }
];

const THEMES = [
  { id: "0 84.2% 60.2%", name: "Crimson Red", tailwind: "bg-red-500" },
  { id: "221.2 83.2% 53.3%", name: "Ocean Blue", tailwind: "bg-blue-500" },
  { id: "142.1 76.2% 36.3%", name: "Forest Green", tailwind: "bg-green-500" },
  { id: "262.1 83.3% 57.8%", name: "Royal Purple", tailwind: "bg-purple-500" },
  { id: "24.6 95% 53.1%", name: "Sunset Orange", tailwind: "bg-orange-500" },
  { id: "0 0% 9%", name: "Stealth Black", tailwind: "bg-neutral-900" },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    themePrimaryColor: "0 84.2% 60.2%",
    fontFamily: "inter",
    layoutStyle: "classic",
  });

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const docSnap = await getDoc(doc(db, "profiles", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            themePrimaryColor: data.themePrimaryColor || "0 84.2% 60.2%",
            fontFamily: data.fontFamily || "inter",
            layoutStyle: data.layoutStyle || "classic",
          });
        }
      } catch (error) {
        toast.error("Failed to load settings");
        systemLog("error", "Failed to load settings in dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "profiles", user.uid), {
        themePrimaryColor: settings.themePrimaryColor,
        fontFamily: settings.fontFamily,
        layoutStyle: settings.layoutStyle,
        updatedAt: new Date().toISOString()
      });
      toast.success("Appearance settings updated successfully!");
      systemLog("info", "User updated global appearance settings");
    } catch (error) {
      toast.error("Failed to save settings");
      systemLog("error", "Failed to save appearance settings", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Appearance & Settings</h1>
        <p className="text-muted-foreground">Customize how your public CV looks to the world.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* THEME COLOR */}
        <Card className="col-span-1 border-primary/20">
          <CardHeader>
             <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5 text-primary" /> Exact Theme Color</CardTitle>
             <CardDescription>Select a global accent color for your CV links and buttons.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
               {THEMES.map((theme) => (
                 <button
                   key={theme.id}
                   onClick={() => setSettings({ ...settings, themePrimaryColor: theme.id })}
                   className={`h-12 w-full rounded-md shadow-sm border-2 transition-all flex items-center justify-center ${settings.themePrimaryColor === theme.id ? "border-primary scale-105 ring-2 ring-primary/50" : "border-transparent hover:scale-105"} ${theme.tailwind}`}
                   title={theme.name}
                 />
               ))}
            </div>
            <div className="space-y-2 pt-4 border-t">
               <Label>Custom HSL Value</Label>
               <Input 
                 value={settings.themePrimaryColor} 
                 onChange={(e) => setSettings({ ...settings, themePrimaryColor: e.target.value })} 
                 placeholder="e.g. 0 84.2% 60.2%" 
               />
               <p className="text-xs text-muted-foreground">Enter a raw HSL string (without 'hsl()') for absolute precision.</p>
            </div>
          </CardContent>
        </Card>

        {/* FONT FAMILY */}
        <Card className="col-span-1 border-primary/20">
          <CardHeader>
             <CardTitle className="flex items-center gap-2"><Type className="w-5 h-5 text-primary" /> Typography</CardTitle>
             <CardDescription>Choose the primary font family for your CV.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {FONTS.map((font) => (
                <div 
                   key={font.id}
                   onClick={() => setSettings({ ...settings, fontFamily: font.id })}
                   className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${settings.fontFamily === font.id ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted"}`}
                >
                   <div className="font-semibold">{font.name}</div>
                </div>
             ))}
          </CardContent>
        </Card>

        {/* LAYOUT STYLE */}
        <Card className="col-span-1 border-primary/20 lg:col-span-1 md:col-span-2">
          <CardHeader>
             <CardTitle className="flex items-center gap-2"><LayoutTemplate className="w-5 h-5 text-primary" /> Premium Layouts</CardTitle>
             <CardDescription>Change the structural blueprint of your CV.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {LAYOUTS.map((layout) => (
                <div 
                   key={layout.id}
                   onClick={() => setSettings({ ...settings, layoutStyle: layout.id })}
                   className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between ${settings.layoutStyle === layout.id ? "border-primary bg-primary/10" : "border-transparent bg-muted/30 hover:bg-muted"}`}
                >
                   <span className="font-medium">{layout.name}</span>
                   <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                     {settings.layoutStyle === layout.id && <div className="w-3 h-3 rounded-full bg-primary" />}
                   </div>
                </div>
             ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={saving} size="lg" className="w-full sm:w-auto">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} 
          Save Global Settings
        </Button>
      </div>
    </div>
  );
}
