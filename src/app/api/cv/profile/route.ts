import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userProfile = await db.query.profile.findFirst({
      where: eq(profile.userId, session.user.id),
    });

    if (!userProfile) return NextResponse.json({ data: null });
    return NextResponse.json({ data: userProfile });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // Check if profile exists
    const existing = await db.query.profile.findFirst({
      where: eq(profile.userId, session.user.id),
    });

    if (existing) {
      // Update
      const [updated] = await db
        .update(profile)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(profile.userId, session.user.id))
        .returning();
      return NextResponse.json({ data: updated });
    } else {
      // Create (usually done during onboarding)
      const [created] = await db
        .insert(profile)
        .values({
          id: crypto.randomUUID(),
          userId: session.user.id,
          username: body.username || session.user.id, // Fallback username
          ...body,
        })
        .returning();
      return NextResponse.json({ data: created });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
