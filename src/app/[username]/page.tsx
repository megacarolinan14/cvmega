import { db } from "@/lib/db";
import { profile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { MapPin, Mail, Phone, ExternalLink } from "lucide-react";

export default async function PublicCVPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  
  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.username, username),
  });

  if (!userProfile) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col md:flex-row gap-12">
      {/* LEFT COLUMN: Sticky Profile */}
      <aside className="w-full md:w-1/3 space-y-8 md:sticky md:top-20 h-fit">
        <div className="space-y-6">
          {userProfile.photoUrl && (
            <img 
              src={userProfile.photoUrl} 
              alt={userProfile.username} 
              className="w-48 h-48 rounded-full object-cover border-4 border-primary/20"
            />
          )}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {/* Fallback to username if name not yet in profile, or fetch from user table if needed */}
              {userProfile.username} 
            </h1>
            <p className="text-xl text-primary font-medium">{userProfile.headline}</p>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground pt-4 border-t">
            {userProfile.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{userProfile.location}</span>
              </div>
            )}
            {userProfile.phone && (
               <div className="flex items-center gap-3">
                 <Phone className="h-4 w-4 text-primary" />
                 <span>{userProfile.phone}</span>
               </div>
            )}
          </div>
          
          <button className="w-full h-10 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors shadow">
            Contact Me
          </button>
        </div>
      </aside>

      {/* RIGHT COLUMN: Content Feed */}
      <main className="w-full md:w-2/3 space-y-12">
        {userProfile.bio && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
              About Me
            </h2>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {userProfile.bio}
            </p>
          </section>
        )}

        {/* Placeholders for Experience, Education, Skills, etc. */}
        <section className="space-y-4">
           <h2 className="text-2xl font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
              Experience
            </h2>
            <div className="p-4 rounded-lg border border-dashed border-muted-foreground/30 text-center text-muted-foreground">
               Experience entries will appear here.
            </div>
        </section>
      </main>
    </div>
  );
}
