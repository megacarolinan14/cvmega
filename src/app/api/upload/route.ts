import { NextRequest, NextResponse } from "next/server";
import { adminStorage } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const path = formData.get("path") as string;

    if (!file || !path) {
      return NextResponse.json({ error: "File and path are required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Explicitly try to get the bucket from config if the default one fails
    const bucketName = adminStorage.bucket().name;
    console.log(`Attempting upload to bucket: ${bucketName || "default"} at path: ${path}`);
    
    const bucket = adminStorage.bucket();
    const storageFile = bucket.file(path);

    try {
      await storageFile.save(buffer, {
        metadata: {
          contentType: file.type,
        },
      });
    } catch (err: any) {
      console.error(`Firebase Storage Save Error (Bucket: ${bucket.name}):`, err);
      // Fallback if the first bucket name failed (some projects use .appspot.com)
      if (err.code === 404 && !bucket.name.includes('appspot.com')) {
        const fallbackBucketName = bucket.name.replace('.firebasestorage.app', '.appspot.com');
        console.log(`Retrying with fallback bucket: ${fallbackBucketName}`);
        const fallbackBucket = adminStorage.bucket(fallbackBucketName);
        await fallbackBucket.file(path).save(buffer, {
          metadata: { contentType: file.type }
        });
        await fallbackBucket.file(path).makePublic();
        const publicUrl = `https://storage.googleapis.com/${fallbackBucketName}/${path}`;
        return NextResponse.json({ url: publicUrl });
      }
      throw err;
    }

    // Make the file public (optional, or use getSignedUrl)
    await storageFile.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${path}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
