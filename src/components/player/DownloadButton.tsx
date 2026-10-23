import { audioUrl, getRecitation } from "@/lib/data";
import { DownloadIcon } from "@/components/ui/icons";

/**
 * تنزيل مباشر من CDN عبر رابط عادي (بلا جافاسكربت وبلا استهلاك ذاكرة):
 * كائنات R2 مضبوطة بترويسة Content-Disposition: attachment
 */
export function DownloadButton({
  surah,
  label,
  fileName,
  className = "",
  iconOnly = false,
}: {
  surah: number;
  label: string;
  fileName?: string;
  className?: string;
  iconOnly?: boolean;
}) {
  const rec = getRecitation(surah);
  if (!rec) return null;
  const name = fileName ?? rec.file;
  return (
    <a
      href={audioUrl(rec.file)}
      download={name}
      aria-label={label}
      title={label}
      className={`inline-flex h-12 min-w-12 items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 text-ink transition-colors hover:border-accent hover:text-accent ${iconOnly ? "px-0" : ""} ${className}`}
    >
      <DownloadIcon width={20} height={20} />
      {!iconOnly && <span className="text-sm font-medium">{label}</span>}
    </a>
  );
}
