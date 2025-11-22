import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const BRAND = "#E39B34";
const BRAND_DARK = "#CF8A2B";
const BRAND_SOFT = "rgba(227,155,52,0.08)";
const BRAND_LIGHT = "rgba(227,155,52,0.04)";

export default function ContactPage() {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    msg: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);

    // TODO: hook up API or email service here
    await new Promise((r) => setTimeout(r, 1500));

    setSending(false);
    setSent(true);
  }

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
              defaultValue: "اسألي عن المواعيد، الأسعار، العروض أو أي استفسار. فريقنا موجود لمساعدتك 👇",
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
              <div className="flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 hover:bg-slate-50 group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 6 11 7 12 1-1 7-6.75 7-12 0-3.86-3.14-7-7-7z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {t("contact.locationLabel", { defaultValue: "الموقع" })}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {t("home.location", {
                      defaultValue: "الرياض - السعودية / Riyadh, Saudi",
                    })}
                  </p>
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div className="flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 hover:bg-slate-50 group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path
                      d="M3 5a2 2 0 0 1 2-2h2l2 5-2 1a12 12 0 0 0 6 6l1-2 5 2v2a2 2 0 0 1-2 2h-1C9.82 19.8 4.2 14.18 3 7V5Z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {t("contact.phoneLabel", { defaultValue: "الهاتف / واتساب" })}
                  </h3>
                  <p className="text-slate-600 mb-3">
                    {t("contact.phoneValue", { defaultValue: "+966 5X XXX XXXX" })}
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg"
                    style={{ backgroundColor: '#25D366' }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.52 3.48A11.78 11.78 0 0 0 12 0C5.37 0 .07 5.3.07 11.87a11.8 11.8 0 0 0 1.6 5.95L0 24l6.39-1.67a11.93 11.93 0 0 0 5.6 1.43h.01c6.62 0 11.92-5.3 11.92-11.87 0-3.18-1.27-6.17-3.4-8.41zM12 21.2h-.01a9.92 9.92 0 0 1-5.06-1.39l-.36-.21-3.79.99 1-3.69-.24-.38a9.7 9.7 0 0 1-1.49-5.17c0-5.43 4.47-9.86 9.96-9.86 2.66 0 5.16 1.03 7.04 2.9a9.77 9.77 0 0 1 2.92 7c0 5.43-4.47 9.87-9.97 9.87z"/>
                    </svg>
                    {t("contact.whatsappCTA", { defaultValue: "راسلنا على واتساب" })}
                  </button>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 hover:bg-slate-50 group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 3" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex-1">
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
            </div>

            {/* Map Section */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span>📍</span>
                {t("contact.mapLabel", { defaultValue: "الموقع على الخريطة" })}
              </h3>
              <div className="rounded-2xl border-2 border-slate-200 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 aspect-video flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <p className="text-slate-500 text-sm">
                    {t("contact.mapPlaceholder", {
                      defaultValue: "خريطة الموقع (يمكن إضافة Google Maps هنا)",
                    })}
                  </p>
                </div>
              </div>
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
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  {t("contact.sentTitle", { defaultValue: "تم إرسال رسالتك بنجاح!" })}
                </h3>
                <p className="text-slate-600 mb-6">
                  {t("contact.sentMessage", {
                    defaultValue: "شكرًا لتواصلك معنا. سنرد عليك في أقرب وقت ممكن.",
                  })}
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", phone: "", msg: "" });
                  }}
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
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {t("contact.submit", { defaultValue: "إرسال الرسالة" })}
                      </>
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
            )}
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-amber-200/30 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="font-semibold text-slate-800">{t("contact.support.title", { defaultValue: "دعم سريع" })}</h3>
                <p className="text-sm text-slate-600">{t("contact.support.desc", { defaultValue: "رد خلال 24 ساعة" })}</p>
              </div>
              
              <div className="space-y-3">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-2xl">🕒</span>
                </div>
                <h3 className="font-semibold text-slate-800">{t("contact.availability.title", { defaultValue: "متاحين دائمًا" })}</h3>
                <p className="text-sm text-slate-600">{t("contact.availability.desc", { defaultValue: "طوال أيام الأسبوع" })}</p>
              </div>
              
              <div className="space-y-3">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-2xl">🌟</span>
                </div>
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