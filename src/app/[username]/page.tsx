import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import { MapPin, Mail, Phone, ExternalLink, Calendar, Layers, Trophy, GraduationCap, Languages, Github } from "lucide-react";

export default async function PublicCVPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  
  const snapshot = await adminDb.collection('profiles').where('username', '==', username).limit(1).get();
  if (snapshot.empty) notFound();

  const userDoc = snapshot.docs[0];
  const profile = userDoc.data();
  const uid = userDoc.id;

  // Fetch all related CV data concurrently
  const [expSnap, eduSnap, skillsSnap, projSnap, certSnap, langSnap] = await Promise.all([
    adminDb.collection('profiles').doc(uid).collection('experiences').orderBy('startDate', 'desc').get(),
    adminDb.collection('profiles').doc(uid).collection('educations').orderBy('startDate', 'desc').get(),
    adminDb.collection('profiles').doc(uid).collection('skills').orderBy('category').get(),
    adminDb.collection('profiles').doc(uid).collection('projects').orderBy('createdAt', 'desc').get(),
    adminDb.collection('profiles').doc(uid).collection('certifications').orderBy('issueDate', 'desc').get(),
    adminDb.collection('profiles').doc(uid).collection('languages').get(),
  ]);

  const experiences = expSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const educations = eduSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const projects = projSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const certs = certSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const languages = langSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Group skills by category
  const skills = skillsSnap.docs.map(doc => doc.data());
  const groupedSkills = skills.reduce((acc: any, skill: any) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const layoutStyle = profile.layoutStyle || "classic";

  // Shared Sub-components for DRY rendering
  const ProfileSide = () => (
    <div className="space-y-6 md:sticky md:top-20">
      {profile.photoUrl && (
        <img src={profile.photoUrl} alt={profile.username} className={`w-48 h-48 object-cover border-4 border-primary/20 bg-muted ${layoutStyle === 'minimalist' ? 'rounded-2xl shadow-xl' : 'rounded-full'}`} />
      )}
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{profile.username}</h1>
        <p className="text-xl text-primary font-medium">{profile.headline}</p>
      </div>
      <div className="space-y-3 text-sm text-muted-foreground pt-4 border-t">
        {profile.location && <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /><span>{profile.location}</span></div>}
        {profile.phone && <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /><span>{profile.phone}</span></div>}
      </div>
      {(profile.location || profile.phone) && (
        <a href={`mailto:hello@example.com`} className="block w-full text-center h-10 leading-10 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors shadow">Contact Me</a>
      )}
      {languages.length > 0 && (
        <div className="pt-6 border-t space-y-3">
           <h3 className="font-bold flex items-center gap-2 text-foreground"><Languages className="w-4 h-4 text-primary" /> Languages</h3>
           {languages.map((l: any) => (
             <div key={l.id} className="flex justify-between text-sm"><span className="text-muted-foreground">{l.name}</span><span className="font-semibold text-primary">{l.proficiency}</span></div>
           ))}
        </div>
      )}
    </div>
  );

  const ContentFeed = () => (
    <div className="space-y-16">
      {profile.bio && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">About Me</h2>
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
        </section>
      )}

      {experiences.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-muted-foreground border-b pb-2 flex items-center gap-2"><Calendar className="w-5 h-5 text-primary"/> Experience</h2>
          <div className="space-y-10">
            {experiences.map((exp: any) => (
              <div key={exp.id} className="relative pl-6 border-l-2 border-primary/20 space-y-2 hover:border-primary transition-colors">
                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7.5px] top-1.5 ring-4 ring-background" />
                <h3 className="text-xl font-bold text-foreground">{exp.role}</h3>
                <div className="font-medium text-primary text-lg">{exp.company}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mb-3">
                  <span>{exp.startDate} — {exp.isCurrent ? "Present" : exp.endDate}</span>
                </div>
                {exp.description && <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {educations.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-muted-foreground border-b pb-2 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary"/> Education</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {educations.map((edu: any) => (
              <div key={edu.id} className="p-5 border rounded-xl shadow-sm bg-card hover:border-primary/50 transition-colors">
                <h3 className="font-bold text-lg">{edu.degree} — {edu.field}</h3>
                <div className="text-primary font-medium mt-1">{edu.institution}</div>
                <div className="text-sm text-muted-foreground mt-2">{edu.startDate} — {edu.isCurrent ? "Present" : edu.endDate} {edu.gpa && <span className="ml-2 pl-2 border-l border-muted-foreground/30">GPA: {edu.gpa}</span>}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {Object.keys(groupedSkills).length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">Skills & Expertise</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Object.entries(groupedSkills).map(([cat, catskills]: [string, any]) => (
              <div key={cat} className="space-y-3">
                <h3 className="font-semibold text-primary">{cat}</h3>
                <div className="flex flex-wrap gap-2">
                  {catskills.map((skill: any) => (
                    <span key={skill.name} className="px-3 py-1 bg-muted text-sm rounded-full font-medium shadow-sm hover:scale-105 transition-transform">{skill.name}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-muted-foreground border-b pb-2 flex items-center gap-2"><Layers className="w-5 h-5 text-primary"/> Key Projects</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((proj: any) => (
              <div key={proj.id} className="border rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-primary/50 transition-colors bg-card">
                 {proj.imageUrl && <div className="h-40 w-full bg-cover bg-center border-b" style={{ backgroundImage: `url(${proj.imageUrl})` }} />}
                 <div className="p-5 flex-grow space-y-3">
                   <h3 className="font-bold text-xl">{proj.title}</h3>
                   <p className="text-sm text-muted-foreground leading-relaxed">{proj.description}</p>
                 </div>
                 {(proj.url || proj.githubUrl) && (
                   <div className="p-5 pt-0 flex gap-4 text-xs font-semibold">
                     {proj.url && <a href={proj.url} target="_blank" className="flex items-center text-primary hover:underline"><ExternalLink className="w-4 h-4 mr-1"/>  View Project</a>}
                     {proj.githubUrl && <a href={proj.githubUrl} target="_blank" className="flex items-center text-muted-foreground hover:text-foreground transition-colors"><Github className="w-4 h-4 mr-1"/> Source</a>}
                   </div>
                 )}
              </div>
            ))}
          </div>
        </section>
      )}

      {certs.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-muted-foreground border-b pb-2 flex items-center gap-2"><Trophy className="w-5 h-5 text-primary"/> Certifications</h2>
          <div className="space-y-4">
             {certs.map((cert: any) => (
               <div key={cert.id} className="p-4 border rounded-lg shadow-sm flex flex-col sm:flex-row justify-between sm:items-center bg-card">
                  <div className="space-y-1">
                     <h4 className="font-bold text-foreground">{cert.name}</h4>
                     <p className="text-primary text-sm font-medium">{cert.issuer}</p>
                  </div>
                  <div className="mt-4 sm:mt-0 text-right space-y-1">
                     <p className="text-sm text-muted-foreground">Issued: {cert.issueDate}</p>
                     {cert.credentialUrl && <a href={cert.credentialUrl} target="_blank" className="text-xs text-blue-500 hover:underline">Verify Credential</a>}
                  </div>
               </div>
             ))}
          </div>
        </section>
      )}
    </div>
  );

  // Dynamic Layout Assembly based on user settings
  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 ${layoutStyle === 'classic' ? 'max-w-4xl' : 'max-w-6xl'}`}>
      {layoutStyle === 'classic' ? (
        <div className="flex flex-col gap-12">
          {/* Top-Down Classic Layout */}
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left border-b pb-12">
             {profile.photoUrl && <img src={profile.photoUrl} alt="Photo" className="w-40 h-40 rounded-full object-cover border-4 border-primary/20" />}
             <div className="space-y-3 flex-1 flex flex-col justify-center h-full">
                <h1 className="text-5xl font-bold tracking-tight">{profile.username}</h1>
                <p className="text-2xl text-primary font-medium">{profile.headline}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground pt-3">
                  {profile.location && <span className="flex items-center gap-2"><MapPin className="w-4 h-4"/>{profile.location}</span>}
                  {profile.phone && <span className="flex items-center gap-2"><Phone className="w-4 h-4"/>{profile.phone}</span>}
                </div>
             </div>
          </div>
          <ContentFeed />
        </div>
      ) : layoutStyle === 'minimalist' ? (
        <div className="flex flex-col gap-16">
          {/* Minimalist Grid Layout */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
             <div className="space-y-4 order-2 md:order-1">
                <h1 className="text-6xl font-black lowercase tracking-tighter">{profile.username}</h1>
                <p className="text-2xl text-primary">{profile.headline}</p>
                <div className="pt-6 border-t font-mono text-sm text-muted-foreground">
                  <p>{profile.location}</p>
                  <p>{profile.phone}</p>
                </div>
             </div>
             {profile.photoUrl && <div className="order-1 md:order-2 flex md:justify-end"><img src={profile.photoUrl} alt="Photo" className="w-64 h-64 shadow-2xl rounded-2xl grayscale hover:grayscale-0 transition-all duration-500 object-cover" /></div>}
          </div>
          <ContentFeed />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-12 md:gap-16">
          {/* Modern Sidebar Layout default */}
          <aside className="w-full md:w-1/3 shrink-0"><ProfileSide /></aside>
          <main className="w-full md:w-2/3"><ContentFeed /></main>
        </div>
      )}
    </div>
  );
}
