"use client";

import { useState, useEffect } from "react";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { Loader2, Trash2, UserPlus, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function UsersManagementPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "profiles"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProfiles(docs);
    } catch (error) {
        console.error("Error fetching profiles:", error);
        toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`Are you sure you want to delete profile @${username}? This cannot be undone.`)) return;
    
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "profiles", id));
      toast.success(`Profile @${username} deleted successfully`);
      setProfiles(profiles.filter(p => p.id !== id));
    } catch (error) {
      toast.error("Failed to delete profile");
    } finally {
        setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage all public CV profiles on your platform.</p>
        </div>
        <Button onClick={() => toast.info("New users can sign up via the Auth page.")}>
          <UserPlus className="mr-2 h-4 w-4" /> Add New User
        </Button>
      </div>

      <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:bg-[#1e1e1e]">
        <CardHeader>
          <CardTitle>All Profiles</CardTitle>
          <CardDescription>
            You can view or delete profiles here. Deleting a profile will remove it from the landing page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <div className="rounded-md border border-border/50 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                        No profiles found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    profiles.map((profile) => (
                      <TableRow key={profile.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                              {profile.fullName?.[0] || profile.username?.[0] || "?"}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">{profile.fullName || "No Name"}</span>
                              <span className="text-xs text-muted-foreground">{profile.email || "No Email"}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link 
                            href={`/${profile.username}`} 
                            target="_blank"
                            className="text-primary hover:underline flex items-center gap-1 font-medium"
                          >
                            @{profile.username}
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {profile.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString() : 
                           (profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                              disabled={deletingId === profile.id}
                              onClick={() => handleDelete(profile.id, profile.username)}
                            >
                              {deletingId === profile.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-blue-700 dark:text-blue-400">Admin Tip</p>
          <p className="text-sm text-blue-600/80 dark:text-blue-400/80 leading-relaxed">
            Halaman ini memungkinkan Anda untuk mengelola semua CV yang ada di platform. Jika username <b>mogenox-design</b> mengganggu, Anda bisa menghapusnya di sini.
          </p>
        </div>
      </div>
    </div>
  );
}
