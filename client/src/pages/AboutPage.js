import { useTranslation } from "react-i18next";

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">{t("about.title")}</h1>
      <p className="mb-4">{t("about.text")}</p>
      <p>{t("about.more")}</p>
    </div>
  );
}