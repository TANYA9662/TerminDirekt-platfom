import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-100 border-t border-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

        {/* Download app */}
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-lg">
            {t("footer.download")}
          </h2>

          <div className="flex flex-col gap-2">
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {t("footer.appstore")}
            </a>

            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {t("footer.googleplay")}
            </a>
          </div>
        </div>

        {/* Account */}
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-lg">
            {t("footer.account")}
          </h2>

          <div className="flex flex-col gap-2">
            <Link to="/login" className="hover:underline">
              {t("footer.login")}
            </Link>

            <Link to="/dashboard" className="hover:underline">
              {t("footer.bookings")}
            </Link>

            <Link to="/support" className="hover:underline">
              {t("footer.support")}
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-lg">
            {t("footer.info")}
          </h2>

          <div className="flex flex-col gap-2">
            <Link to="/about" className="hover:underline">
              {t("footer.about")}
            </Link>

            <Link to="/privacy" className="hover:underline">
              {t("footer.privacy")}
            </Link>

            <Link to="/terms" className="hover:underline">
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-300 text-center text-sm text-gray-600 py-4">
        © {new Date().getFullYear()} TerminDirekt. {t("footer.rights")}
      </div>
    </footer>
  );
}

