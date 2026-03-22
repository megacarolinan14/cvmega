import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { experience, profile } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

// GET all experiences for the logged-in user
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userProfile = await db.query.profile.findFirst({
      where: eq(profile.userId, session.user.id),
    });

    if (!userProfile) return NextResponse.json({ data: [] });

    const data = await db.query.experience.findMany({
      where: eq(experience.profileId, userProfile.id),
      orderBy: (experience, { desc }) => [desc(experience.sortOrder)],
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch experiences" }, { status: 500 });
  }
}

// POST new experience
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userProfile = await db.query.profile.findFirst({
      where: eq(profile.userId, session.user.id),
    });
    if (!userProfile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const body = await req.json();

    const [created] = await db
      .insert(experience)
      .values({
        id: crypto.randomUUID(),
        profileId: userProfile.id,
        ...body,
      })
      .returning();

    return NextResponse.json({ data: created });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create experience" }, { status: 500 });
  }
}
