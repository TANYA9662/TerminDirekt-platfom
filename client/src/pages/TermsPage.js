import { useTranslation } from "react-i18next";

// TermsPage
export function TermsPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">{t("terms.title")}</h1>
      <p className="mb-4">{t("terms.intro")}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t("terms.sections.service_desc")}</h2>
      <p className="mb-4">{t("terms.sections.service_desc_text")}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t("terms.sections.user_account")}</h2>
      <p className="mb-4">{t("terms.sections.user_account_text")}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t("terms.sections.booking")}</h2>
      <p className="mb-4">{t("terms.sections.booking_text")}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t("terms.sections.cancellation")}</h2>
      <p className="mb-4">{t("terms.sections.cancellation_text")}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t("terms.sections.changes")}</h2>
      <p>{t("terms.sections.changes_text")}</p>
    </div>
  );
}