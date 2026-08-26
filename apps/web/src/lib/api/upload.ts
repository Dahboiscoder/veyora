import { api } from "./client";

export interface UploadContext {
  context: "avatar" | "property" | "company";
  propertyId?: string;
  companyId?: string;
}

/**
 * Two-step upload: ask our API for a presigned PUT URL (auth + ownership
 * checked server-side), then PUT the bytes straight to MinIO/S3 from the
 * browser — the file never passes through our Node process.
 */
export async function uploadFile(file: File, ctx: UploadContext, onProgress?: (pct: number) => void): Promise<string> {
  const presign = await api.post<{ uploadUrl: string; publicUrl: string }>("/api/media/presign", {
    ...ctx,
    filename: file.name,
    contentType: file.type,
  });

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presign.uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });

  return presign.publicUrl;
}
