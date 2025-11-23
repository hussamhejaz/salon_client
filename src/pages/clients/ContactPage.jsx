import React from "react";
import { useTranslation } from "react-i18next";
import { useContactForm } from "../../hooks/useContactForm";

const BRAND = "#E39B34";
const BRAND_DARK = "#CF8A2B";
const BRAND_SOFT = "rgba(227,155,52,0.08)";
const BRAND_LIGHT = "rgba(227,155,52,0.04)";
const MAP_COORDINATES = "24.682715,46.819880";
const MAP_LINK_URL = `https://www.google.com/maps/search/${MAP_COORDINATES}`;
const MAP_EMBED_URL = `https://www.google.com/maps?q=${MAP_COORDINATES}&z=18&output=embed`;
const PHONE_NUMBER = "+966 538 216 056";
const PHONE_LINK = "tel:+966538216056";
const WHATSAPP_LINK = "https://wa.me/966538216056";

export default function ContactPage() {
  const { t } = useTranslation();
  const {
    form,
    handleChange,
    handleSubmit,
    resetForm,
    sending,
    sent,
    error,
  } = useContactForm();

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-amber-200/50 shadow-sm mb-6">
            <div className="w-2 h-2 rounded-full animate-pulse bg-amber-500"></div>
            <span className="text-sm font-medium text-slate-600">
              {t("contact.badge", { defaultValue: "تواصل معنا" })}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            {t("contact.title", { defaultValue: "تواصل معنا" })}
          </h1>

          <div className="w-24 h-1.5 rounded-full mx-auto mb-6 bg-gradient-to-r from-amber-400 to-orange-500" />
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t("contact.subtitle", {
              defaultValue: "اسألي عن المواعيد، الأسعار، العروض أو أي استفسار. فريقنا موجود لمساعدتك ",
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Information Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <div className="w-2 h-8 rounded-full" style={{ backgroundColor: BRAND }}></div>
              {t("contact.infoTitle", { defaultValue: "معلومات التواصل" })}
            </h2>

            <div className="space-y-6">
              {/* Location */}
              <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 transition-all duration-300 hover:bg-slate-50 group">
                <h3 className="font-semibold text-slate-900 mb-1">
                  {t("contact.locationLabel", { defaultValue: "الموقع" })}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {t("contact.locationValue", {
                    defaultValue: "Istanbul Street, Al Faiha, Riyadh, Saudi Arabia",
                  })}
                </p>
              </div>

              {/* Phone / WhatsApp */}
              <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 transition-all duration-300 hover:bg-slate-50 group">
                <h3 className="font-semibold text-slate-900 mb-1">
                  {t("contact.phoneLabel", { defaultValue: "الهاتف / واتساب" })}
                </h3>
                <p className="text-slate-600 mb-3">
                  <a
                    href={PHONE_LINK}
                    className="font-semibold text-slate-900 transition hover:text-slate-700"
                  >
                    {t("contact.phoneValue", { defaultValue: PHONE_NUMBER })}
                  </a>
                </p>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold text-white transition-transform duration-300 hover:shadow-lg"
                  style={{ backgroundColor: "#25D366" }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  {t("contact.whatsappCTA", { defaultValue: "راسلنا على واتساب" })}
                </a>
              </div>

              {/* Working Hours */}
              <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 transition-all duration-300 hover:bg-slate-50 group">
                <h3 className="font-semibold text-slate-900 mb-1">
                  {t("contact.hoursLabel", { defaultValue: "ساعات العمل" })}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {t("contact.hoursValue", {
                    defaultValue: "يومياً 10 صباحًا - 11 مساءً",
                  })}
                </p>
              </div>
            </div>

            {/* Map Section */}
            <div className="mt-8 pt-8 border-t border-slate-200 space-y-4">
              <h3 className="font-semibold text-slate-900">
                {t("contact.mapLabel", { defaultValue: "الموقع على الخريطة" })}
              </h3>
              <div className="rounded-2xl border-2 border-slate-200 overflow-hidden aspect-video">
                <iframe
                  title={t("contact.mapLabel", { defaultValue: "موقعنا على الخريطة" })}
                  src={MAP_EMBED_URL}
                  loading="lazy"
                  className="w-full h-full block"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <p className="text-slate-500 text-sm">
                {t("contact.mapDescription", {
                  defaultValue: "Live view of our Riyadh location. Tap the link below to open it in Google Maps.",
                })}
              </p>
              <a
                href={MAP_LINK_URL}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-amber-600 transition hover:text-amber-500"
              >
                {t("contact.mapLinkCTA", { defaultValue: "Open in Google Maps" })}
              </a>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-2 h-8 rounded-full" style={{ backgroundColor: BRAND }}></div>
              {t("contact.formTitle", { defaultValue: "أرسلي رسالة" })}
            </h2>
            
            <p className="text-slate-600 mb-8 leading-relaxed">
              {t("contact.formSubtitle", {
                defaultValue: "اسألي عن أي خدمة وسنرد عليك بأقرب وقت.",
              })}
            </p>

            {sent ? (
              <div className="text-center py-12">
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  {t("contact.sentTitle", { defaultValue: "تم إرسال رسالتك بنجاح!" })}
                </h3>
                <p className="text-slate-600 mb-6">
                  {t("contact.sentMessage", {
                    defaultValue: "شكرًا لتواصلك معنا. سنرد عليك في أقرب وقت ممكن.",
                  })}
                </p>
                <button
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 rounded-2xl font-semibold px-6 py-3 transition-all duration-300 hover:shadow-lg"
                  style={{
                    backgroundColor: BRAND,
                    color: 'white',
                  }}
                >
                  {t("contact.sendAnother", { defaultValue: "إرسال رسالة أخرى" })}
                </button>
              </div>
            ) : (
              <>
                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <p className="font-semibold">
                      {t("contact.errorMessage", {
                        defaultValue: "تعذر إرسال الرسالة. يرجى المحاولة لاحقًا.",
                      })}
                    </p>
                    <p className="text-xs text-red-700/80">{error}</p>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {t("contact.name", { defaultValue: "الاسم الكامل" })}
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 transition-all duration-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none"
                    placeholder={t("contact.namePlaceholder", { defaultValue: "أدخل اسمك الكامل" })}
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {t("contact.phone", { defaultValue: "رقم الجوال" })}
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="+9665XXXXXXXX"
                    className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 transition-all duration-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {t("contact.msg", { defaultValue: "رسالتك / سؤالك" })}
                  </label>
                  <textarea
                    name="msg"
                    rows={6}
                    value={form.msg}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 transition-all duration-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none resize-none"
                    placeholder={t("contact.msgPlaceholder", { defaultValue: "اكتبي رسالتك أو استفسارك هنا..." })}
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={sending}
                    className="
                      w-full rounded-2xl px-6 py-4 font-bold text-lg
                      transition-all duration-300 hover:shadow-lg
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center justify-center gap-3
                    "
                    style={{
                      backgroundColor: sending ? '#cbd5e1' : BRAND,
                      color: 'white',
                    }}
                    onMouseEnter={(e) => !sending && (e.target.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => !sending && (e.target.style.transform = 'translateY(0)')}
                  >
                    {sending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {t("contact.sending", { defaultValue: "جاري الإرسال..." })}
                      </>
                    ) : (
                      t("contact.submit", { defaultValue: "إرسال الرسالة" })
                    )}
                  </button>
                </div>

                {/* Privacy Note */}
                <div className="text-center">
                  <p className="text-xs text-slate-500">
                    {t("contact.privacyNote", {
                      defaultValue: "بياناتك محمية وسيتم استخدامها للرد على استفسارك فقط.",
                    })}
                  </p>
                </div>
              </form>
            </>
          )}
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-amber-200/30 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-800">{t("contact.support.title", { defaultValue: "دعم سريع" })}</h3>
                <p className="text-sm text-slate-600">{t("contact.support.desc", { defaultValue: "رد خلال 24 ساعة" })}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-800">{t("contact.availability.title", { defaultValue: "متاحين دائمًا" })}</h3>
                <p className="text-sm text-slate-600">{t("contact.availability.desc", { defaultValue: "طوال أيام الأسبوع" })}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-800">{t("contact.expertise.title", { defaultValue: "خبراء متخصصون" })}</h3>
                <p className="text-sm text-slate-600">{t("contact.expertise.desc", { defaultValue: "استشارات مجانية" })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
