import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import { MapPin, Mail, Phone, ExternalLink, Calendar } from "lucide-react";

export default async function PublicCVPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  
  const snapshot = await adminDb.collection('profiles').where('username', '==', username).limit(1).get();

  if (snapshot.empty) notFound();

  const userDoc = snapshot.docs[0];
  const userProfile = userDoc.data();

  // Fetch experiences subcollection
  const experiencesSnapshot = await adminDb
    .collection('profiles')
    .doc(userDoc.id)
    .collection('experiences')
    .orderBy('startDate', 'desc')
    .get();

  const experiences = experiencesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col md:flex-row gap-12">
      {/* LEFT COLUMN: Sticky Profile */}
      <aside className="w-full md:w-1/3 space-y-8 md:sticky md:top-20 h-fit">
        <div className="space-y-6">
          {userProfile.photoUrl && (
            <img 
              src={userProfile.photoUrl} 
              alt={userProfile.username} 
              className="w-48 h-48 rounded-full object-cover border-4 border-primary/20 bg-muted"
            />
          )}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
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

        {/* Dynamic Experience Section */}
        <section className="space-y-6">
           <h2 className="text-2xl font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
              Experience
            </h2>
            
            {experiences.length === 0 ? (
              <div className="p-4 rounded-lg border border-dashed border-muted-foreground/30 text-center text-muted-foreground">
                 Experience entries will appear here.
              </div>
            ) : (
              <div className="space-y-8">
                {experiences.map((exp: any) => (
                  <div key={exp.id} className="relative pl-6 border-l-2 border-primary/20 space-y-2">
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5 ring-4 ring-background" />
                    <h3 className="text-xl font-bold text-foreground">{exp.role}</h3>
                    <div className="font-medium text-primary text-lg">{exp.company}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mb-3">
                      <Calendar className="h-4 w-4" />
                      <span>{exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}</span>
                    </div>
                    {exp.description && (
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
        </section>
      </main>
    </div>
  );
}
