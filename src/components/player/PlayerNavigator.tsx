"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePlayer } from "./store";
import { href, type Locale } from "@/i18n/config";

const SURAH_PATH = /^(?:\/en)?\/surah\/(\d+)\/?$/;

/** صفحات «الاستماع»: صفحة السورة، الرئيسية، وقائمة السور */
const LISTENING_PAGES = new Set(["/", "/en", "/en/", "/surahs", "/surahs/", "/en/surahs", "/en/surahs/"]);

/**
 * يجعل الموقع يتبع التلاوة الجارية: عند اختيار سورة (من الرئيسية أو قائمة السور)
 * أو عند الانتقال إلى السورة التالية تلقائيًا بعد انتهاء التلاوة، يُفتح رابط السورة
 * الجارية حتى يظهر نصها وتتبّع الآيات.
 *
 * لا يتدخّل هذا المكوّن في التصفّح الحر: لا يُعاد المستخدم إلى صفحة السورة إن كان
 * يتصفّح صفحة أخرى (مثل «عن الشيخ»)، ولا يُقاطَع التنقّل اليدوي بين السور، وإنما
 * يتغيّر الاتباع فقط عند تغيّر السورة المشغّلة.
 */
export function PlayerNavigator({ locale }: { locale: Locale }) {
  const current = usePlayer((s) => s.current);
  const pathname = usePathname();
  const router = useRouter();
  const followed = useRef<number | null>(null);

  useEffect(() => {
    if (!current || followed.current === current) return;
    followed.current = current;

    const path = pathname ?? "/";
    const match = path.match(SURAH_PATH);
    if (match && Number(match[1]) === current) return;
    if (!match && !LISTENING_PAGES.has(path)) return;

    router.push(href(locale, `/surah/${current}`));
  }, [current, pathname, locale, router]);

  return null;
}
