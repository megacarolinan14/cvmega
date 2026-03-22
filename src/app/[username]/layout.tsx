import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import { Inter, Roboto, Playfair_Display, Fira_Code } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "700"] });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "700"] });
const firaCode = Fira_Code({ subsets: ["latin"], weight: ["400", "500", "700"] });

export default async function PublicCVLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  
  // Fetch user profile from Firestore Admin SDK
  const snapshot = await adminDb.collection('profiles').where('username', '==', username).limit(1).get();

  if (snapshot.empty) {
    notFound();
  }

  const userProfile = snapshot.docs[0].data();

  // Inject user's custom primary color and font dynamically
  const themePrimaryColor = userProfile.themePrimaryColor || "0 84.2% 60.2%"; // Fallback to Red
  let fontClass = inter.className;
  if (userProfile.fontFamily === "roboto") fontClass = roboto.className;
  if (userProfile.fontFamily === "playfair") fontClass = playfair.className;
  if (userProfile.fontFamily === "fira-code") fontClass = firaCode.className;

  return (
    <div 
      className={`cv-public-wrapper min-h-screen bg-background ${fontClass}`}
      style={{
        "--primary": themePrimaryColor,
        "--primary-foreground": "210 40% 98%" 
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
