import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export function PrivacyPolicyPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">{t("privacy.title")}</h1>
      <p className="mb-4">{t("privacy.intro")}</p>

      {t("privacy.sections", { returnObjects: true }).map((section, i) => (
        <div key={i}>
          <h2 className="text-xl font-semibold mt-6 mb-2">{section.title}</h2>
          <p className="mb-4">{section.text}</p>
        </div>
      ))}
    </div>
  );
}