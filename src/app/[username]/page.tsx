import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Mail, Phone, ExternalLink, Calendar, Layers, Trophy, GraduationCap, Languages, Github, Share2, MoreVertical, BadgeCheck, LayoutDashboard, Instagram, Linkedin, Twitter, Globe, Link as LinkIcon } from "lucide-react";

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

  const [expSnap, eduSnap, skillsSnap, projSnap, certSnap, langSnap, socialSnap] = await Promise.all([
    adminDb.collection('profiles').doc(uid).collection('experiences').orderBy('startDate', 'desc').get(),
    adminDb.collection('profiles').doc(uid).collection('educations').orderBy('startDate', 'desc').get(),
    adminDb.collection('profiles').doc(uid).collection('skills').orderBy('category').get(),
    adminDb.collection('profiles').doc(uid).collection('projects').orderBy('createdAt', 'desc').get(),
    adminDb.collection('profiles').doc(uid).collection('certifications').orderBy('issueDate', 'desc').get(),
    adminDb.collection('profiles').doc(uid).collection('languages').get(),
    adminDb.collection('profiles').doc(uid).collection('socials').get(),
  ]);

  const experiences = expSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const educations = eduSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const projects = projSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const certs = certSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const languages = langSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const skills = skillsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const socials = socialSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // ... [dynamic theme, getDuration, calculateAge] ...

  const socialIconMap: Record<string, any> = {
    instagram: Instagram,
    linkedin: Linkedin,
    github: Github,
    twitter: Twitter,
    portfolio: Globe,
    other: LinkIcon,
  };

  // Dynamic Theme Styling
  const primaryColor = profile.themePrimaryColor || "0 84.2% 60.2%";
  const fontFamily = profile.fontFamily || "inter";
  
  const fontMap: Record<string, string> = {
    inter: "'Inter', sans-serif",
    roboto: "'Roboto', sans-serif",
    playfair: "'Playfair Display', serif",
    "fira-code": "'Fira Code', monospace",
  };
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

  // Function to calculate age
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
  };

  const age = calculateAge(profile.birthDate);

  return (
    <div 
      className="min-h-screen bg-[#F8F9FB] dark:bg-[#121212] py-8 px-4 sm:px-8 flex justify-center selection:bg-primary/30"
      style={{ 
        "--primary": primaryColor,
        fontFamily: fontMap[fontFamily] || fontMap.inter
      } as React.CSSProperties}
    >
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
              <div className="absolute top-4 right-4 flex gap-3 items-center">
                <Link 
                  href="/dashboard"
                  className="px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <div className="flex gap-2">
                  <button className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
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
                {profile.displayName || profile.username || profile.name} 
                <BadgeCheck className="w-6 h-6 text-pink-500 fill-pink-500/20" />
              </h1>
              
              <p className="text-[17px] text-foreground/80 font-medium mb-4">
                {profile.headline}
              </p>
              
              <div className="flex items-center gap-3 text-sm text-foreground/50 font-medium mb-6">
                {profile.location && <span>{profile.location}</span>}
                {profile.location && age && <span>|</span>}
                {age && <span>{age} Years Old</span>}
              </div>

              {/* Social Icons */}
              {socials.length > 0 && (
                <div className="flex items-center gap-4 mb-8">
                  {socials.map((social: any) => {
                    const Icon = socialIconMap[social.platform] || LinkIcon;
                    return (
                      <a 
                        key={social.id} 
                        href={social.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl bg-muted/50 hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all hover:scale-110"
                        title={social.platform}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              )}

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
              <div className="space-y-8">
                {experiences.map((exp: any, i: number) => (
                  <div key={exp.id} className={`flex flex-col gap-2 ${i !== experiences.length - 1 ? "pb-8 border-b border-border/50" : ""}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-lg text-foreground">{exp.company}</h3>
                          <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                            i % 2 === 0 ? "bg-primary/20 text-primary" 
                            : "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                          }`}>
                            {exp.role}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-foreground/50">
                          {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate} ({getDuration(exp.startDate, exp.endDate, exp.isCurrent)})
                        </div>
                      </div>
                    </div>
                    {exp.description && (
                      <p className="text-foreground/70 text-sm leading-relaxed whitespace-pre-wrap mt-2">
                        {exp.description}
                      </p>
                    )}
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
                      {edu.gpa && <p className="text-xs text-primary font-bold mt-1">GPA: {edu.gpa}</p>}
                    </div>
                    <div className="text-sm font-medium text-foreground/50 shrink-0 sm:text-right">
                      {new Date(edu.startDate).getFullYear()} - {edu.isCurrent ? "Present" : new Date(edu.endDate).getFullYear()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {projects.length > 0 && (
            <div className="bg-white dark:bg-[#1e1e1e] rounded-[2rem] p-8 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none">
              <h2 className="text-xl font-bold text-foreground mb-6">Portfolio & Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((proj: any) => (
                  <div key={proj.id} className="group border rounded-2xl overflow-hidden bg-muted/10 hover:border-primary/50 transition-all flex flex-col">
                    {proj.imageUrl && (
                      <div className="h-40 overflow-hidden">
                        <img src={proj.imageUrl} alt={proj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="p-4 flex-grow space-y-2">
                      <h3 className="font-bold text-foreground">{proj.title}</h3>
                      <p className="text-xs text-foreground/60 line-clamp-3">{proj.description}</p>
                    </div>
                    <div className="p-4 pt-0 flex gap-3">
                      {proj.url && (
                        <a href={proj.url} target="_blank" className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> Live
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a href={proj.githubUrl} target="_blank" className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground flex items-center gap-1">
                          <Github className="w-3 h-3" /> Code
                        </a>
                      )}
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
              <h2 className="text-xl font-bold text-foreground mb-6">Skills & Capabilities</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: any) => (
                  <div 
                    key={skill.name} 
                    className="px-3 py-1.5 bg-muted/30 border border-border/50 rounded-lg text-xs font-bold text-foreground/70"
                  >
                    {skill.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications Card */}
          {certs.length > 0 && (
            <div className="bg-white dark:bg-[#1e1e1e] rounded-[2rem] p-8 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none">
              <h2 className="text-xl font-bold text-foreground mb-6">Certifications</h2>
              <div className="space-y-4">
                {certs.map((cert: any) => (
                  <div key={cert.id} className="space-y-1">
                    <div className="font-bold text-foreground text-sm flex items-start justify-between gap-2">
                      {cert.name}
                      {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank"><ExternalLink className="w-3 h-3 text-primary mt-1" /></a>
                      )}
                    </div>
                    <div className="text-[11px] text-primary font-bold">{cert.issuer}</div>
                    <div className="text-[10px] text-foreground/40">{cert.issueDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages Card */}
          {languages.length > 0 && (
            <div className="bg-white dark:bg-[#1e1e1e] rounded-[2rem] p-8 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none">
              <h2 className="text-xl font-bold text-foreground mb-4">Languages</h2>
              <div className="space-y-3">
                {languages.map((lang: any) => (
                  <div key={lang.id} className="flex justify-between items-center text-sm">
                    <span className="font-bold text-foreground/80">{lang.name}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-muted/50 text-foreground/40`}>
                      {lang.proficiency}
                    </span>
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
