import { db } from "@/lib/db";
import { profile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function PublicCVLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  
  // Fetch user profile to get their theme configuration
  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.username, username),
  });

  if (!userProfile) {
    notFound();
  }

  // Inject user's custom primary color dynamically using CSS variables
  const themePrimaryColor = userProfile.themePrimaryColor || "0 84.2% 60.2%"; // Fallback to Red

  return (
    <div 
      className="cv-public-wrapper min-h-screen bg-background"
      style={{
        "--primary": themePrimaryColor,
        // Calculate a foreground version based on lightness (basic logic)
        // If it's a very light color, use dark text, else light text
        "--primary-foreground": "210 40% 98%" 
      } as React.CSSProperties}
    >
      {/* The injected CSS variables will instantly affect all Tailwind classes using bg-primary, text-primary within this tree */}
      {children}
    </div>
  );
}
