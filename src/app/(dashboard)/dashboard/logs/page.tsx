"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, limit, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Info, AlertTriangle, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type SystemLog = {
  id: string;
  level: "info" | "warn" | "error";
  message: string;
  details: string | null;
  timestamp: any;
  url: string;
};

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "system_logs"), orderBy("timestamp", "desc"), limit(50));
      const snapshot = await getDocs(q);
      const data: SystemLog[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as SystemLog);
      });
      setLogs(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch system logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const clearLogs = async () => {
    if (!confirm("Are you sure you want to delete all visible logs?")) return;
    try {
      setLoading(true);
      await Promise.all(logs.map(log => deleteDoc(doc(db, "system_logs", log.id))));
      setLogs([]);
      toast.success("Logs cleared.");
    } catch (error) {
      toast.error("Failed to clear logs.");
    } finally {
      setLoading(false);
    }
  };

  const IconForLevel = (level: string) => {
    switch (level) {
      case "error": return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "warn": return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center bg-transparent">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">System Logs & Debugger</h1>
          <p className="text-muted-foreground">Monitor real-time application errors, warnings, and events.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLogs} disabled={loading}>
             <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="destructive" onClick={clearLogs} disabled={logs.length === 0 || loading}>
             <Trash2 className="mr-2 h-4 w-4" /> Clear All
          </Button>
        </div>
      </div>

      <Card className="border-primary/20 shadow-sm">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" /> Application Event Feed
          </CardTitle>
          <CardDescription>
            Showing the last 50 recorded system events across all users.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading && logs.length === 0 ? (
             <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : logs.length === 0 ? (
             <div className="p-12 text-center text-muted-foreground">
               No system logs recorded yet. Everything is running smoothly!
             </div>
          ) : (
             <div className="divide-y divide-border/50">
               {logs.map((log) => (
                 <div key={log.id} className="p-4 flex gap-4 hover:bg-muted/10 transition-colors">
                   <div className="mt-1 flex-shrink-0">
                     {IconForLevel(log.level)}
                   </div>
                   <div className="flex-1 space-y-2 overflow-hidden">
                     <div className="flex justify-between items-start gap-4">
                       <h3 className={`font-semibold text-md ${log.level === 'error' ? 'text-red-500' : log.level === 'warn' ? 'text-yellow-600 dark:text-yellow-500' : 'text-foreground'}`}>
                         [{log.level.toUpperCase()}] {log.message}
                       </h3>
                       <span className="text-xs text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded-md">
                         {log.timestamp ? new Date(log.timestamp.toDate()).toLocaleString() : "Just now"}
                       </span>
                     </div>
                     
                     <div className="text-xs text-muted-foreground break-words truncate">
                       <span className="font-semibold">URL Session:</span> {log.url}
                     </div>

                     {log.details && (
                       <div className="mt-2 bg-muted/50 p-3 rounded-md border text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                         {log.details}
                       </div>
                     )}
                   </div>
                 </div>
               ))}
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
