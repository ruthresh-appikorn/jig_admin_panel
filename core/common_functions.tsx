import { Avatar } from "@heroui/react";
import { image_http } from "@/components/global-components/image_http";
import { ASSETS } from "@/config/assets";

export function dateToMillis(dateStr: string): string | null {
  // Validate YYYY-MM-DD format
  const regex = /^\d{4}-\d{2}-\d{2}$/;

  if (!regex.test(dateStr)) return null;

  const date = new Date(dateStr);

  // Check if the date is valid
  if (isNaN(date.getTime())) return null;

  return date.getTime().toString();
}

//  1062268200000 -> 'YYYY-MM-DD'
export const formatDateFromMillis = (
  millis?: string | number | null
): string => {
  if (!millis) return "";

  const num = Number(millis);
  if (isNaN(num)) return "";

  const date = new Date(num);
  if (isNaN(date.getTime())) return "";

  return date.toISOString().split("T")[0]; // Gives 'YYYY-MM-DD'
};

//  1062268200000 -> ''

export const formatTimestampToTime = (
  timestamp?: string | number | null
): string => {
  if (!timestamp) return "-";

  const date = new Date(Number(timestamp));
  if (isNaN(date.getTime())) return "-";

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const formattedMinutes = minutes.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

// 1062268200000 -> 'Oct 23, 2025'
export const formatMilliBeautify = (
  millis?: string | number | null
): string => {
  if (!millis) return "";

  const num = Number(millis);
  if (isNaN(num)) return "";

  const date = new Date(num);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatDecimalHours = (
  hours: number | null | undefined
): string => {
  if (hours == null || isNaN(hours)) return "-";

  const totalMinutes = Math.round(hours * 60);
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (mins === 0) {
    return `${hrs} hr${hrs !== 1 ? "s" : ""}`;
  }

  return `${hrs} hr${hrs !== 1 ? "s" : ""} ${mins} min${mins !== 1 ? "s" : ""}`;
};

export const UserAvatarCell = ({
  imageKey,
  name,
  className = "",
}: {
  imageKey?: string;
  name: string;
  className?: string; // optional
}) => {
  const imageUrl = image_http(imageKey);

  return (
    <Avatar
      className={`w-10 h-10 bg-white ${className}`}
      radius="full"
      size="sm"
      name={name}
      src={imageUrl || ASSETS.team.avatar_5}
    />
  );
};

// Read html

export const fetchHtmlFromKey = async (
  htmlKey: string | null | undefined
): Promise<string> => {
  if (!htmlKey) return "";

  try {
    const { createProxyS3Client } = await import("@/core/ftp");
    const client = createProxyS3Client();

    const result = await client.downloadObject("", htmlKey);

    if (!result.ok || !result.data) {
      console.warn("Failed to download HTML:", htmlKey);
      return "";
    }

    // Browser blob
    if ("blob" in result.data && result.data.blob) {
      return await result.data.blob.text();
    }

    // S3 Body (Uint8Array, Buffer, ArrayBuffer, or string)
    if ("Body" in result.data && result.data.Body) {
      const body = result.data.Body as unknown;

      if (typeof body === "string") {
        return body;
      }

      if (body instanceof Uint8Array) {
        return new TextDecoder().decode(body);
      }

      if (body instanceof ArrayBuffer) {
        return new TextDecoder().decode(new Uint8Array(body));
      }

      console.warn("Unsupported Body type:", body);
      return "";
    }

    return "";
  } catch (err) {
    console.error("Error fetching HTML:", err);
    return "";
  }
};

// ===========================================================
//  Download document (PDF, image, doc, etc.) from S3
// ===========================================================
export const fetchDocumentFromKey = async (
  fileKey: string | null | undefined
): Promise<{ url: string | null; fileName: string | null }> => {
  if (!fileKey) return { url: null, fileName: null };

  try {
    const { createProxyS3Client } = await import("@/core/ftp");
    const client = createProxyS3Client();

    const result = await client.downloadObject("", fileKey);

    if (!result.ok || !result.data?.blob) {
      console.warn("Failed to download file:", fileKey);
      return { url: null, fileName: null };
    }

    const blob = result.data.blob;
    const url = URL.createObjectURL(blob);
    const fileName = fileKey.split("/").pop() || "document";

    return { url, fileName };
  } catch (err) {
    console.error("Download error:", err);
    return { url: null, fileName: null };
  }
};

export function extractCleanFileName(key: string): string {
  if (!key || typeof key !== "string") return "";

  // Step 1: take last part after "/"
  const fileName = key.split("/").pop() || "";

  // Step 2: remove timestamp prefix (14–16 digits + underscore)
  return fileName.replace(/^\d{14,16}_/, "");
}

export const isSmallScreen = () => window.matchMedia("(max-width: 639px)").matches;