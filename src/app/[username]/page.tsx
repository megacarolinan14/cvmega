import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import { MapPin, Mail, Phone, ExternalLink, Calendar, Layers, Trophy, GraduationCap, Languages, Github, Share2, MoreVertical, BadgeCheck } from "lucide-react";

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
  const skills = skillsSnap.docs.map(doc => doc.data());

  // Function to calculate duration
  const getDuration = (start: string, end: string | null, isCurrent: boolean) => {
    if (!start) return "";
    const startDate = new Date(start);
    const endDate = isCurrent || !end ? new Date() : new Date(end);
    let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    months -= startDate.getMonth();
    months += endDate.getMonth();
    months = months <= 0 ? 1 : months;
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0 && remainingMonths > 0) return `${years} yrs, ${remainingMonths} mos`;
    if (years > 0) return `${years} yrs`;
    return `${months} mos`;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#121212] py-8 px-4 sm:px-8 flex justify-center selection:bg-primary/30">
      <div className="w-full max-w-[1200px] flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left/Center Column - Main Content */}
        <div className="w-full lg:w-[65%] shrink-0 flex flex-col gap-8">
          
          {/* Main Profile Card */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-[2rem] shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden relative">
            {/* Banner */}
            <div className="h-40 w-full bg-gradient-to-r from-primary/80 to-primary/40 dark:from-primary/60 dark:to-primary/20 relative">
              {/* Pattern Overlay placeholder */}
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
              
              {/* Action Buttons Top Right */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Avatar & Info */}
            <div className="px-8 pb-10 flex flex-col items-center text-center -mt-16 relative z-10">
              <div className="w-32 h-32 rounded-full overflow-hidden border-[6px] border-white dark:border-[#1e1e1e] bg-muted shadow-sm mb-4">
                {profile.photoUrl ? (
                   <img src={profile.photoUrl} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
                )}
              </div>
              
              <p className="text-sm text-foreground/60 font-medium mb-1">@{profile.username}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center justify-center gap-2 mb-2">
                {profile.name || profile.username} 
                <BadgeCheck className="w-6 h-6 text-pink-500 fill-pink-500/20" />
              </h1>
              
              <p className="text-[17px] text-foreground/80 font-medium mb-4">
                {profile.headline}
              </p>
              
              <div className="flex items-center gap-3 text-sm text-foreground/50 font-medium mb-8">
                {profile.location && <span>{profile.location}</span>}
                {profile.location && <span>|</span>}
                <span>Joined {new Date(profile.createdAt || Date.now()).toLocaleDateString([], { month: 'long', year: 'numeric' })}</span>
              </div>

              <div className="flex items-center gap-4">
                <a href={`mailto:hello@example.com`} className="px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all shadow-md shadow-primary/20 active:scale-95">
                  Contact Me
                </a>
                {profile.url && (
                  <a href={profile.url} target="_blank" className="px-8 py-3 rounded-xl border-2 border-border hover:border-foreground/20 dark:hover:border-border text-foreground font-semibold transition-all active:scale-95">
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* About Section */}
          {profile.bio && (
            <div className="bg-white dark:bg-[#1e1e1e] rounded-[2rem] p-8 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none">
              <h2 className="text-xl font-bold text-foreground mb-4">About</h2>
              <p className="text-foreground/70 leading-relaxed font-medium">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Experience Section */}
          {experiences.length > 0 && (
            <div className="bg-white dark:bg-[#1e1e1e] rounded-[2rem] p-8 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none">
              <h2 className="text-xl font-bold text-foreground mb-6">Experience</h2>
              <div className="space-y-6">
                {experiences.map((exp: any, i: number) => (
                  <div key={exp.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${i !== experiences.length - 1 ? "pb-6 border-b border-border/50" : ""}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg text-foreground">{exp.company}</h3>
                        {/* Fake location tags based on image reference */}
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                          i % 2 === 0 ? "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300" 
                          : "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                        }`}>
                          {i % 2 === 0 ? "Remote" : "On-Site"}
                        </span>
                      </div>
                      <p className="text-foreground/70 font-medium">{exp.role}</p>
                    </div>
                    <div className="text-sm font-medium pr-4 text-foreground/50 shrink-0 sm:text-right">
                      {getDuration(exp.startDate, exp.endDate, exp.isCurrent)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Education Section */}
          {educations.length > 0 && (
            <div className="bg-white dark:bg-[#1e1e1e] rounded-[2rem] p-8 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none">
              <h2 className="text-xl font-bold text-foreground mb-6">Education</h2>
              <div className="space-y-6">
                {educations.map((edu: any, i: number) => (
                  <div key={edu.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${i !== educations.length - 1 ? "pb-6 border-b border-border/50" : ""}`}>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground mb-1">{edu.institution}</h3>
                      <p className="text-foreground/70 font-medium">{edu.degree} in {edu.field}</p>
                    </div>
                    <div className="text-sm font-medium text-foreground/50 shrink-0 sm:text-right">
                      {new Date(edu.startDate).getFullYear()} - {edu.isCurrent ? "Present" : new Date(edu.endDate).getFullYear()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column - Sidebar Widgets */}
        <div className="w-full lg:w-[35%] flex flex-col gap-8">
          
          {/* Top Skills Card */}
          {skills.length > 0 && (
            <div className="bg-white dark:bg-[#1e1e1e] rounded-[2rem] p-8 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none">
              <h2 className="text-xl font-bold text-foreground mb-6">Top Skills</h2>
              <div className="flex flex-wrap gap-2.5">
                {skills.map((skill: any) => (
                  <div 
                    key={skill.name} 
                    className="px-4 py-2 border-2 border-border/60 hover:border-foreground/20 dark:border-border dark:hover:border-foreground/40 rounded-xl text-sm font-semibold text-foreground/80 transition-colors cursor-default"
                  >
                    {skill.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages Card */}
          {languages.length > 0 && (
            <div className="bg-white dark:bg-[#1e1e1e] rounded-[2rem] p-8 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none">
              <h2 className="text-xl font-bold text-foreground mb-6">Languages</h2>
              <div className="space-y-4">
                {languages.map((lang: any) => (
                  <div key={lang.id} className="flex justify-between items-center">
                    <span className="font-semibold text-foreground/80">{lang.name}</span>
                    <span className="text-sm text-foreground/50 font-medium">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Card (Acting as reviews replacement visually) */}
          {projects.length > 0 && (
            <div className="bg-white dark:bg-[#1e1e1e] rounded-[2rem] p-8 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none">
              {/* Fake Segmented Control */}
              <div className="flex items-center bg-muted/50 rounded-xl p-1 mb-8">
                <div className="flex-1 text-center py-2 bg-background shadow-sm rounded-lg text-sm font-bold text-foreground">Projects</div>
                <div className="flex-1 text-center py-2 text-sm font-semibold text-foreground/50">Certifications</div>
              </div>
              
              <div className="space-y-6">
                {projects.slice(0, 3).map((proj: any) => (
                  <div key={proj.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                       <div className="font-bold text-foreground">{proj.title}</div>
                       {proj.url && (
                         <a href={proj.url} target="_blank" className="text-xs text-primary font-bold hover:underline">Link</a>
                       )}
                    </div>
                    <p className="text-sm text-foreground/60 leading-relaxed font-medium line-clamp-3">
                      {proj.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
