import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useSearchParams } from "react-router-dom";

import i18n from "../../i18n.js"; // Import i18n instance
import { API_BASE } from "../../config/api";
import { usePublicServices } from "../../hooks/usePublicServices";
import RiyalIcon from "../RiyalIcon";

const BRAND = "#E39B34";
const BRAND_DARK = "#CF8A2B";
const BRAND_SOFT = "rgba(227,155,52,0.08)";
const BRAND_LIGHT = "rgba(227,155,52,0.04)";

/* ---------- Helper Functions ---------- */
const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

function normalizeSlotEntry(slot) {
  if (!slot) return null;
  if (typeof slot === "string") return slot;
  if (typeof slot === "object") {
    if (Object.prototype.hasOwnProperty.call(slot, "is_active") && !slot.is_active) {
      return null;
    }
    return slot.slot_time || slot.time || slot.value || null;
  }
  return null;
}

function collectSlotTimes(data) {
  const slotGroups = [];
  if (Array.isArray(data.available_slots)) {
    slotGroups.push(data.available_slots);
  }
  if (Array.isArray(data.time_slots)) {
    slotGroups.push(data.time_slots);
  }
  if (Array.isArray(data.slots)) {
    slotGroups.push(data.slots);
  }

  const seen = new Set();
  const normalized = [];

  slotGroups.forEach((group) => {
    group.forEach((slot) => {
      const value = normalizeSlotEntry(slot);
      if (value && !seen.has(value)) {
        seen.add(value);
        normalized.push(value);
      }
    });
  });

  return normalized;
}

function formatSlotLabel(value, locale) {
  if (!value) return "";
  const [hour, minute] = value.split(":").map((part) => Number(part));
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value;
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDurationLabel(minutes, t) {
  const duration = Math.max(0, Number(minutes) || 0);
  if (!duration) {
    return t("book.durationVaries", { defaultValue: "المدة حسب الخدمة" });
  }
  const hours = Math.floor(duration / 60);
  const remainingMinutes = duration % 60;
  if (hours && remainingMinutes) {
    return t("book.durationHoursMinutes", {
      hours,
      minutes: remainingMinutes,
      defaultValue: `${hours} ساعة و ${remainingMinutes} دقيقة`,
    });
  }
  if (hours) {
    return t("book.durationHours", {
      hours,
      defaultValue: `${hours} ساعة`,
    });
  }
  return t("book.durationMinutes", {
    minutes: duration,
    defaultValue: `${duration} دقيقة`,
  });
}

function formatPriceLabel(price, t) {
  const numeric = Number(price);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return t("book.priceOnRequest", { defaultValue: "السعر حسب الطلب" });
  }
  return `${Math.round(numeric).toLocaleString()} ر.س`;
}

// Use local date parts to avoid timezone shifts when formatting YYYY-MM-DD
function formatLocalDate(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const parseNumberParam = (value) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
};

const ORIGINAL_PRICE_FIELDS = [
  "offer_original_price",
  "original_price",
  "price_before_offer",
];

function getOriginalPriceValue(service) {
  if (!service) return undefined;
  for (const key of ORIGINAL_PRICE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(service, key)) {
      const parsed = parseNumberParam(service[key]);
      if (parsed !== undefined) {
        return parsed;
      }
    }
  }
  return undefined;
}

function shouldShowOriginalPrice(currentValue, originalValue) {
  if (currentValue === undefined || originalValue === undefined) return false;
  return originalValue > currentValue;
}

/* ---------- Calendar Components ---------- */
function CalendarHeader({ currentMonth, onPrevious, onNext, canGoPrevious, canGoNext }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <h3 className="text-xl font-bold text-slate-900">
        {currentMonth.toLocaleString(undefined, { month: "long", year: "numeric" })}
      </h3>

      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

function CalendarDay({ date, selectedDate, onDateSelect, today, currentMonth }) {
  if (!date) {
    return <div className="h-12"></div>;
  }

  const isToday = sameDay(date, today);
  const isSelected = selectedDate && sameDay(date, selectedDate);
  const isDisabled = date < today;
  const isCurrentMonth = date.getMonth() === currentMonth.getMonth();

  return (
    <button
      type="button"
      onClick={() => !isDisabled && onDateSelect(date)}
      disabled={isDisabled}
      className={`
        h-12 rounded-lg text-sm font-medium transition-all duration-200 relative
        flex items-center justify-center
        ${!isCurrentMonth ? "text-slate-300" : ""}
        ${
          isDisabled
            ? "text-slate-300 cursor-not-allowed"
            : isSelected
            ? "bg-amber-500 text-white shadow-lg transform scale-105"
            : isToday
            ? "bg-amber-100 text-amber-700 border-2 border-amber-300"
            : "text-slate-700 hover:bg-slate-50 hover:border-2 hover:border-slate-200"
        }
      `}
    >
      {date.getDate()}

      {isToday && !isSelected && (
        <div className="absolute bottom-1 w-1 h-1 bg-amber-500 rounded-full"></div>
      )}
    </button>
  );
}

function CalendarGrid({ month, selectedDate, onDateSelect, today }) {
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).getDay();

  // Adjust for Arabic (Sunday is 0, but we want Saturday to be first in Arabic)
  const weekStart = i18n.language?.startsWith("ar") ? 6 : 0;
  const adjustedFirstDay = (firstDayOfMonth - weekStart + 7) % 7;

  const days = [];

  // Empty cells before first day
  for (let i = 0; i < adjustedFirstDay; i++) {
    days.push(null);
  }

  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    days.push(date);
  }

  const weekDays = i18n.language?.startsWith("ar")
    ? ["س", "ح", "ن", "ث", "ر", "خ", "ج"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-1 mb-3">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center text-sm font-medium text-slate-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <CalendarDay
            key={index}
            date={date}
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
            today={today}
            currentMonth={month}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- Time Slot Components ---------- */
function TimeSlot({ value, label, selected, onSelect, available = true }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      disabled={!available}
      className={`
        px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all duration-200
        ${
          selected
            ? "border-amber-500 bg-amber-50 text-amber-700 shadow-sm"
            : available
            ? "border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:shadow-sm"
            : "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"
        }
      `}
    >
      {label}
    </button>
  );
}

/* ---------- Service Card Component ---------- */
function ServiceCard({
  service,
  selected,
  onSelect,
  durationLabel,
  priceLabel,
  originalPriceLabel,
}) {
  const iconContent = service.icon || service.name?.charAt(0) || "✧";
  return (
    <button
      type="button"
      onClick={() => onSelect(service.id)}
      className={`
        w-full p-4 rounded-xl border-2 text-left transition-all duration-300
        flex items-start gap-3 group
        ${
          selected
            ? "border-amber-500 bg-amber-50 shadow-sm"
            : "border-slate-200 bg-white hover:border-amber-300 hover:shadow-sm"
        }
      `}
    >
      <div
        className={`
          w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-semibold
          ${selected ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600"}
        `}
      >
        {iconContent}
      </div>
      <div className="flex-1 space-y-1">
        <h4 className={`font-semibold ${selected ? "text-amber-700" : "text-slate-800"}`}>
          {service.name || service.label || "الخدمة"}
        </h4>
        {service.description && <p className="text-sm text-slate-600">{service.description}</p>}
        <div className="flex items-center flex-wrap gap-3 text-xs text-slate-500">
          {durationLabel && (
            <span className="flex items-center gap-1">
              <span>⏱</span>
              <span>{durationLabel}</span>
            </span>
          )}
          {priceLabel && (
            <div className="flex flex-col gap-1 text-slate-500">
              <div className="flex items-center gap-1">
                <RiyalIcon size={14} />
                <span className="font-semibold text-slate-800">{priceLabel}</span>
              </div>
              {originalPriceLabel && (
                <div className="flex items-center gap-1 text-xs text-slate-400 line-through">
                  <RiyalIcon size={12} />
                  <span>{originalPriceLabel}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {selected && (
        <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}

/* ---------- Main Component ---------- */
export default function BookingForm({ salonId }) {
  const { t, i18n: i18nHook } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const searchServiceId = searchParams.get("serviceId");
  const locationOffer = location.state?.offer;
  const searchParamsString = searchParams.toString();
  const offerContext = useMemo(() => {
    const params = new URLSearchParams(searchParamsString);
    const offerId = params.get("offerId") || locationOffer?.id;
    const serviceId = params.get("serviceId") || locationOffer?.service_id;
    const durationMinutes =
      parseNumberParam(params.get("offerDuration")) ??
      locationOffer?.duration_minutes ??
      locationOffer?.duration;
    const price =
      parseNumberParam(params.get("offerPrice")) ??
      locationOffer?.price ??
      locationOffer?.final_price ??
      locationOffer?.total_price;

    return {
      offerId,
      serviceId,
      durationMinutes,
      price,
    };
  }, [searchParamsString, locationOffer]);
  const linkedServiceId = offerContext.serviceId || searchServiceId;

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [workingDay, setWorkingDay] = useState(null);
  const [slotDetails, setSlotDetails] = useState("");
  const [slotStrategy, setSlotStrategy] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkedService, setLinkedService] = useState(null);
  const [linkedServiceLoading, setLinkedServiceLoading] = useState(false);
  const [linkedServiceError, setLinkedServiceError] = useState("");
  const [linkedServiceAppliedId, setLinkedServiceAppliedId] = useState(null);
  const userSelectedServiceRef = useRef(false);

  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const lang = (i18nHook.resolvedLanguage || i18nHook.language || "ar").toLowerCase();
    document.documentElement.dir = lang.startsWith("ar") ? "rtl" : "ltr";
  }, [i18nHook.language, i18nHook.resolvedLanguage]);

  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const { services: fetchedServices, loading: servicesLoading, error: servicesError } =
    usePublicServices(salonId);

  const fallbackServices = useMemo(
    () => [
      {
        id: "fallback-hair",
        name: t("main.sections.hair", { defaultValue: "تصفيف الشعر" }),
        description: t("main.sections.hairDesc", { defaultValue: "قص، صبغة، علاجات متخصصة" }),
        icon: "✂️",
        duration_minutes: 75,
      },
      {
        id: "fallback-nails",
        name: t("main.sections.nails", { defaultValue: "العناية بالأظافر" }),
        description: t("main.sections.nailsDesc", { defaultValue: "مانيكير، باديكير، أظافر أكريلك" }),
        icon: "💅",
        duration_minutes: 90,
      },
      {
        id: "fallback-makeup",
        name: t("main.sections.makeup", { defaultValue: "المكياج" }),
        description: t("main.sections.makeupDesc", { defaultValue: "مكياج يومي، سهرة، مناسبات" }),
        icon: "💄",
        duration_minutes: 60,
      },
      {
        id: "fallback-spa",
        name: t("main.sections.spa", { defaultValue: "علاجات الوجه والسبا" }),
        description: t("main.sections.spaDesc", { defaultValue: "مساجات، علاجات بشرة، استرخاء" }),
        icon: "🌸",
        duration_minutes: 80,
      },
    ],
    [t]
  );

  const serviceOptions = useMemo(() => {
    let normalizedList = fetchedServices?.length
      ? fetchedServices.map((serviceItem) => ({
          ...serviceItem,
          duration_minutes: Number(serviceItem.duration_minutes) || 0,
        }))
      : fallbackServices;

    if (linkedService) {
      const normalizedLinked = {
        ...linkedService,
        duration_minutes: Number(linkedService.duration_minutes) || 0,
      };
      const existsInList = normalizedList.some((item) => item.id === normalizedLinked.id);
      if (existsInList) {
        normalizedList = normalizedList.map((item) =>
          item.id === normalizedLinked.id ? normalizedLinked : item
        );
      } else {
        normalizedList = [normalizedLinked, ...normalizedList];
      }
    }

    if (offerContext.serviceId) {
      normalizedList = normalizedList.map((item) => {
        if (item.id !== offerContext.serviceId) return item;
        const updated = { ...item };
        if (typeof offerContext.durationMinutes === "number") {
          updated.duration_minutes = offerContext.durationMinutes;
        }
        if (typeof offerContext.price === "number") {
          const servicePriceValue = parseNumberParam(item.price);
          if (
            servicePriceValue !== undefined &&
            !Object.prototype.hasOwnProperty.call(updated, "offer_original_price")
          ) {
            updated.offer_original_price = servicePriceValue;
          }
          updated.price = offerContext.price;
        }
        return updated;
      });
    }

    return normalizedList;
  }, [fetchedServices, fallbackServices, linkedService, offerContext]);

  const selectedService = useMemo(
    () => serviceOptions.find((item) => item.id === selectedServiceId),
    [serviceOptions, selectedServiceId]
  );

  const selectedServicePriceValue = parseNumberParam(selectedService?.price);
  const selectedServiceOriginalPriceValue = getOriginalPriceValue(selectedService);
  const selectedServicePriceLabel =
    selectedService?.price || selectedService?.price === 0
      ? formatPriceLabel(selectedService.price, t)
      : undefined;
  const selectedServiceOriginalPriceLabel =
    shouldShowOriginalPrice(selectedServicePriceValue, selectedServiceOriginalPriceValue)
      ? formatPriceLabel(selectedServiceOriginalPriceValue, t)
      : undefined;

  const slotLocale = i18nHook.language || "en-US";
  const handleServiceSelect = (serviceId) => {
    userSelectedServiceRef.current = true;
    setSelectedServiceId(serviceId);
  };

  useEffect(() => {
    if (!salonId || !linkedServiceId) {
      setLinkedService(null);
      setLinkedServiceAppliedId(null);
      setLinkedServiceError("");
      setLinkedServiceLoading(false);
      userSelectedServiceRef.current = false;
      return;
    }

    if (linkedServiceAppliedId === linkedServiceId) {
      return;
    }

    const existingService = fetchedServices?.find((item) => item.id === linkedServiceId);
    if (existingService) {
      setLinkedService(existingService);
      if (!userSelectedServiceRef.current) {
        setSelectedServiceId(linkedServiceId);
        setSelectedDate((prev) => prev || today);
        setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
      }
      setLinkedServiceAppliedId(linkedServiceId);
      setLinkedServiceLoading(false);
      setLinkedServiceError("");
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const loadLinkedService = async () => {
      try {
        setLinkedServiceLoading(true);
        setLinkedServiceError("");
        const response = await fetch(
          `${API_BASE}/api/public/${salonId}/services/${linkedServiceId}`,
          { signal: controller.signal }
        );
        const data = await response.json();
        if (!isMounted) return;
        if (!response.ok || data.ok === false || !data.service) {
          throw new Error(data.error || "Failed to load service");
        }
        const normalizedService = {
          ...data.service,
          duration_minutes: Number(data.service.duration_minutes) || 0,
        };
        setLinkedService(normalizedService);
        if (!userSelectedServiceRef.current) {
          setSelectedServiceId(normalizedService.id);
          setSelectedDate((prev) => prev || today);
          setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
        }
        setLinkedServiceAppliedId(linkedServiceId);
      } catch (error) {
        if (!isMounted) return;
        console.error("Linked service fetch failed:", error);
        setLinkedServiceError(
          error.message || "تعذر تحميل الخدمة المختارة."
        );
        setLinkedService(null);
      } finally {
        if (isMounted) {
          setLinkedServiceLoading(false);
        }
      }
    };

    loadLinkedService();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [linkedServiceId, linkedServiceAppliedId, fetchedServices, salonId, today]);

  // 🔴 UPDATED EFFECT: use service.time_slots if present, otherwise call /hours
  useEffect(() => {
    if (!selectedService || !selectedDate || !salonId) {
      setAvailableSlots([]);
      setSlotsError("");
      setWorkingDay(null);
      setSlotDetails("");
      setSlotStrategy("");
      setSlotsLoading(false);
      return;
    }

    const hasServiceSlots =
      Array.isArray(selectedService.time_slots) && selectedService.time_slots.length > 0;

    // 1️⃣ Use time_slots from service if they exist
    if (hasServiceSlots) {
      const slots = collectSlotTimes({
        time_slots: selectedService.time_slots,
      });

      setSlotsLoading(false);
      setSlotsError("");
      setAvailableSlots(slots);
      setSlotDetails("");
      setSlotStrategy("service_time_slots");
      setWorkingDay(null);
      return; // don't call API
    }

    // 2️⃣ Fallback: fetch from /hours
    const controller = new AbortController();
    const params = new URLSearchParams();
    params.set("date", formatLocalDate(selectedDate));
    if (selectedService.duration_minutes) {
      params.set("duration_minutes", String(selectedService.duration_minutes));
    }
    params.set("service_id", selectedService.id);
    params.set("type", "salon");

    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);
        setSlotsError("");
        const response = await fetch(
          `${API_BASE}/api/public/${salonId}/hours?${params.toString()}`,
          { signal: controller.signal }
        );
        const data = await response.json();

        if (!response.ok || data.ok === false) {
          throw new Error(data.error || "Failed to load availability");
        }

        const slots = collectSlotTimes(data);
        setAvailableSlots(slots);
        setSlotDetails(data.details || "");
        setSlotStrategy(data.slot_strategy || "");

        if (data.working_hours) {
          setWorkingDay({ ...data.working_hours, is_closed: false });
        } else if (
          typeof data.details === "string" &&
          data.details.toLowerCase().includes("closed")
        ) {
          setWorkingDay({ is_closed: true });
        } else {
          setWorkingDay(null);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Availability fetch failed:", error);
          setSlotsError(
            error.message ||
              t("book.slotsFetchFailed", { defaultValue: "تعذر تحميل الأوقات المتاحة حاليًا." })
          );
          setAvailableSlots([]);
          setWorkingDay(null);
          setSlotDetails("");
          setSlotStrategy("");
        }
      } finally {
        if (!controller.signal.aborted) {
          setSlotsLoading(false);
        }
      }
    };

    fetchSlots();

    return () => {
      controller.abort();
    };
  }, [selectedService, selectedDate, salonId, t]);

  useEffect(() => {
    if (selectedTime && !availableSlots.includes(selectedTime)) {
      setSelectedTime("");
    }
  }, [availableSlots, selectedTime]);

  useEffect(() => {
    setSelectedTime("");
  }, [selectedServiceId]);

  // Calendar navigation
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const previousMonth = () => {
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    if (prevMonth >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setCurrentMonth(prevMonth);
    }
  };

  const canGoPrevious = () => {
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    return prevMonth >= new Date(today.getFullYear(), today.getMonth(), 1);
  };

  const canGoNext = () => {
    const maxDate = new Date(today.getFullYear() + 2, today.getMonth(), 1);
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    return next <= maxDate;
  };

  function validate() {
    const e = {};
    if (!selectedDate) e.date = t("form.err.date", { defaultValue: "الرجاء اختيار تاريخ." });
    if (!selectedTime) e.time = t("form.err.time", { defaultValue: "الرجاء اختيار الوقت." });
    if (!selectedService)
      e.service = t("form.err.service", { defaultValue: "الرجاء اختيار الخدمة." });
    if (!name.trim())
      e.name = t("form.err.name", { defaultValue: "الرجاء إدخال الاسم الكامل." });
    const cleaned = phone.replace(/[^\d+]/g, "");
    if (!cleaned || !/^\+?\d{7,15}$/.test(cleaned))
      e.phone = t("form.err.phone", { defaultValue: "الرجاء إدخال رقم هاتف صحيح." });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = t("form.err.email", { defaultValue: "الرجاء إدخال بريد إلكتروني صحيح." });
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    const eMap = validate();
    setErrors(eMap);
    if (Object.keys(eMap).length) {
      setFormError(
        t("book.validationFailed", {
          defaultValue: "يرجى إكمال الحقول المطلوبة قبل تأكيد الحجز.",
        })
      );
      setCurrentStep(2);
      return;
    }

    if (!salonId) {
      setFormError(t("book.missingSalon", { defaultValue: "معرف الصالون غير متوفر." }));
      return;
    }

    if (!selectedService) {
      setFormError(
        t("book.serviceMissing", { defaultValue: "يرجى اختيار خدمة قبل المتابعة." })
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_email: email.trim() || null,
        customer_notes: notes.trim() || null,
        service_id: selectedService.id,
        booking_date: formatLocalDate(selectedDate),
        booking_time: selectedTime,
        duration_minutes: selectedService.duration_minutes || undefined,
        total_price:
          Number.isFinite(Number(selectedService.price)) && Number(selectedService.price) > 0
            ? Number(selectedService.price)
            : undefined,
      };

      if (offerContext.offerId) {
        payload.offer_id = offerContext.offerId;
      }

      const response = await fetch(`${API_BASE}/api/public/${salonId}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.ok === false) {
        throw new Error(data.error || data.message || "Booking failed");
      }

      setConfirmation({
        booking: data.booking,
        message: data.message,
      });
      setCurrentStep(3);
    } catch (error) {
      console.error("Booking request failed:", error);
      const message =
        error.message || t("book.bookingFailed", { defaultValue: "تعذر إرسال الطلب، الرجاء المحاولة لاحقًا." });
      const isConflict = message.includes("BOOKING_CONFLICT");
      if (isConflict) {
        const conflictMessage = t("book.bookingConflict", {
          defaultValue: "الوقت الذي اخترته غير متاح بعد الآن؛ الرجاء اختيار وقت آخر.",
        });
        setFormError(conflictMessage);
        setErrors((prev) => ({
          ...prev,
          time: conflictMessage,
        }));
        setCurrentStep(1);
        setSelectedTime("");
        return;
      }
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const resetForm = () => {
    setSelectedDate(null);
    setSelectedTime("");
    setSelectedServiceId("");
    setName("");
    setPhone("");
    setEmail("");
    setNotes("");
    setCurrentStep(1);
    setErrors({});
    setFormError("");
    setAvailableSlots([]);
    setWorkingDay(null);
    setConfirmation(null);
    setCurrentMonth(new Date());
    setLinkedService(null);
    setLinkedServiceError("");
    setLinkedServiceLoading(false);
    setLinkedServiceAppliedId(null);
    userSelectedServiceRef.current = false;
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  if (confirmation) {
    const { booking, message } = confirmation;
    const displayDate = booking?.booking_date
      ? new Date(`${booking.booking_date}T00:00:00`).toLocaleDateString(slotLocale, {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : selectedDate?.toLocaleDateString(slotLocale, {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
    const displayTime = formatSlotLabel(booking?.booking_time || selectedTime, slotLocale);
    const serviceName =
      booking?.services?.name ||
      selectedService?.name ||
      t("book.service", { defaultValue: "الخدمة" });
    const durationLabel = formatDurationLabel(
      booking?.duration_minutes || selectedService?.duration_minutes,
      t
    );
    const confirmationPriceRaw =
      booking?.total_price ??
      booking?.price ??
      selectedService?.price;
    const confirmationPriceValue = parseNumberParam(confirmationPriceRaw);
    const confirmationOriginalPriceValue = getOriginalPriceValue(selectedService);
    const confirmationPriceLabel =
      confirmationPriceRaw || confirmationPriceRaw === 0
        ? formatPriceLabel(confirmationPriceRaw, t)
        : undefined;
    const confirmationOriginalPriceLabel =
      shouldShowOriginalPrice(
        confirmationPriceValue,
        confirmationOriginalPriceValue
      )
        ? formatPriceLabel(confirmationOriginalPriceValue, t)
        : undefined;

    return (
      <section className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center border border-emerald-100">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-emerald-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            {t("book.success", { defaultValue: "تم تأكيد الحجز بنجاح!" })}
          </h2>
          <p className="text-lg text-slate-600 mb-6 max-w-md mx-auto">
            {message ||
              t("book.successDesc", {
                defaultValue:
                  "تم إرسال تفاصيل الحجز إلى بريدك الإلكتروني. سنتصل بك لتأكيد الموعد.",
              })}
          </p>
            <div className="bg-slate-50 rounded-2xl p-6 mb-6 text-left">
              <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">
                  {t("book.detail.service", {
                    defaultValue: "Service:",
                  })}
                </span>
                <p className="font-medium text-slate-800">{serviceName}</p>
              </div>
              <div>
                <span className="text-slate-500">
                  {t("book.detail.datetime", {
                    defaultValue: "Date & time:",
                  })}
                </span>
                <p className="font-medium text-slate-800">
                  {displayDate}
                  {displayTime ? ` - ${displayTime}` : ""}
                </p>
              </div>
              <div>
                <span className="text-slate-500">
                  {t("book.detail.duration", {
                    defaultValue: "Duration:",
                  })}
                </span>
                <p className="font-medium text-slate-800">{durationLabel}</p>
              </div>
              <div>
                <span className="text-slate-500">
                  {t("book.detail.status", {
                    defaultValue: "Status:",
                  })}
                </span>
                <p className="font-medium text-slate-800">
                  {booking?.status ||
                    t("book.statusPending", { defaultValue: "Pending review" })}
                </p>
              </div>
              {confirmationPriceLabel && (
                <div className="mt-4 text-sm text-slate-600">
                  <span className="text-slate-500">
                    {t("book.detail.price", {
                      defaultValue: "Price:",
                    })}
                  </span>
                  <div className="mt-1 flex items-center gap-2 font-medium text-slate-800">
                    <RiyalIcon size={16} />
                    <span>{confirmationPriceLabel}</span>
                  </div>
                  {confirmationOriginalPriceLabel && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-400 line-through">
                      <RiyalIcon size={12} />
                      <span>{confirmationOriginalPriceLabel}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={resetForm}
            className="
              inline-flex items-center gap-3 rounded-2xl font-semibold px-8 py-4
              transition-all duration-300 hover:shadow-lg
            "
            style={{
              backgroundColor: BRAND,
              color: "white",
            }}
          >
            {t("book.newBooking", { defaultValue: "حجز جديد" })}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Progress Steps */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                transition-all duration-300
                ${
                  currentStep >= step
                    ? "bg-amber-500 text-white shadow-lg"
                    : "bg-slate-200 text-slate-500"
                }
              `}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`
                  flex-1 h-1 mx-2 transition-all duration-300
                  ${currentStep > step ? "bg-amber-500" : "bg-slate-200"}
                `}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 text-sm text-center">
          <div
            className={`font-medium ${
              currentStep >= 1 ? "text-amber-600" : "text-slate-500"
            }`}
          >
            {t("book.step1", "الخدمة والموعد")}
          </div>
          <div
            className={`font-medium ${
              currentStep >= 2 ? "text-amber-600" : "text-slate-500"
            }`}
          >
            {t("book.step2", "المعلومات الشخصية")}
          </div>
          <div
            className={`font-medium ${
              currentStep >= 3 ? "text-amber-600" : "text-slate-500"
            }`}
          >
            {t("book.step3", "التأكيد")}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          {t("book.title", { defaultValue: "احجز موعدًا" })}
        </h1>
        <div className="w-24 h-1.5 rounded-full mx-auto mb-6 bg-gradient-to-r from-amber-400 to-orange-500" />
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          {t("book.subtitle", {
            defaultValue:
              "اختر الخدمة والتاريخ المناسبين، وسنقوم بتأكيد الحجز معك قريبًا.",
          })}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Service & Date Selection */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Services */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
              <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-2 h-6 rounded-full bg-amber-500"></div>
                {t("book.chooseService", { defaultValue: "اختر الخدمة" })}
              </h4>

              <div className="space-y-4">
                {servicesLoading ? (
                  <div className="h-36 flex items-center justify-center text-sm text-slate-500 space-x-2">
                    <div
                      className="w-10 h-10 border-4 border-amber-300 border-t-transparent rounded-full animate-spin"
                      style={{ borderLeftColor: BRAND }}
                    />
                    <span>
                      {t("book.loadingServices", {
                        defaultValue: "جاري تحميل الخدمات...",
                      })}
                    </span>
                  </div>
                ) : (
                  serviceOptions.map((item) => {
                    const priceLabel =
                      item.price || item.price === 0
                        ? formatPriceLabel(item.price, t)
                        : undefined;
                    const currentPriceValue = parseNumberParam(item.price);
                    const originalPriceValue = getOriginalPriceValue(item);
                    const originalPriceLabel =
                      shouldShowOriginalPrice(currentPriceValue, originalPriceValue)
                        ? formatPriceLabel(originalPriceValue, t)
                        : undefined;

                    return (
                      <ServiceCard
                        key={item.id}
                        service={item}
                        selected={selectedServiceId === item.id}
                        onSelect={handleServiceSelect}
                        durationLabel={formatDurationLabel(
                          item.duration_minutes,
                          t
                        )}
                        priceLabel={priceLabel}
                        originalPriceLabel={originalPriceLabel}
                      />
                    );
                  })
                )}
              </div>

              {linkedServiceId && linkedServiceLoading && (
                <p className="mt-4 text-sm text-slate-500 flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin inline-block" />
                  {t("book.loadingLinkedService", {
                    defaultValue: "جاري تحميل الخدمة المختارة...",
                  })}
                </p>
              )}
              {linkedServiceId && linkedServiceError && (
                <p className="mt-4 text-sm text-rose-600 flex items-center gap-2">
                  <span>⚠️</span>
                  {linkedServiceError}
                </p>
              )}

              {servicesError && (
                <p className="mt-4 text-sm text-rose-600 flex items-center gap-2">
                  <span>⚠️</span>
                  {servicesError}
                </p>
              )}

              {errors.service && (
                <p className="mt-4 text-sm text-rose-600 flex items-center gap-2">
                  <span>⚠️</span>
                  {errors.service}
                </p>
              )}
            </div>

            {/* Date & Time */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
              <h4 className="text-xl font-bold text-slate-900 mb-6 flex itemscenter gap-3">
                <div className="w-2 h-6 rounded-full bg-amber-500"></div>
                {t("book.chooseDateTime", { defaultValue: "اختر التاريخ والوقت" })}
              </h4>

              {/* Calendar */}
              <div className="mb-6">
                <CalendarHeader
                  currentMonth={currentMonth}
                  onPrevious={previousMonth}
                  onNext={nextMonth}
                  canGoPrevious={canGoPrevious()}
                  canGoNext={canGoNext()}
                />

                <CalendarGrid
                  month={currentMonth}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  today={today}
                />

                {errors.date && (
                  <p className="mt-3 text-sm text-rose-600 flex items-center gap-2">
                    <span>⚠️</span>
                    {errors.date}
                  </p>
                )}
              </div>

              {selectedDate && (
                <div>
                  <h5 className="font-semibold text-slate-800 mb-4">
                    {t("book.availableTimes", {
                      defaultValue: "الأوقات المتاحة",
                    })}
                  </h5>
                  {!selectedService ? (
                    <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 border border-amber-100">
                      {t("book.chooseServiceFirst", {
                        defaultValue: "اختر الخدمة أولاً ليتم عرض الأوقات.",
                      })}
                    </div>
                  ) : slotsLoading ? (
                    <div className="h-32 flex flex-col items-center justify-center gap-2 text-sm text-slate-500">
                      <div
                        className="w-10 h-10 border-4 border-amber-300 border-t-transparent rounded-full animate-spin"
                        style={{ borderRightColor: BRAND }}
                      />
                      {t("book.loadingSlots", {
                        defaultValue: "جاري تحديث الأوقات...",
                      })}
                    </div>
                  ) : slotsError ? (
                    <div className="text-sm text-rose-600">{slotsError}</div>
                  ) : availableSlots.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 border border-slate-200">
                      {slotDetails
                        ? slotDetails
                        : workingDay?.is_closed
                        ? t("book.closed", {
                            defaultValue: "الصالون مغلق في هذا اليوم.",
                          })
                        : t("book.noSlots", {
                            defaultValue: "لا توجد أوقات متاحة في هذا اليوم.",
                          })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {availableSlots.map((slot) => (
                        <TimeSlot
                          key={slot}
                          value={slot}
                          label={formatSlotLabel(slot, slotLocale)}
                          selected={selectedTime === slot}
                          onSelect={setSelectedTime}
                        />
                      ))}
                    </div>
                  )}

                  {errors.time && (
                    <p className="mt-3 text-sm text-rose-600 flex items-center gap-2">
                      <span>⚠️</span>
                      {errors.time}
                    </p>
                  )}

                  {slotStrategy && (
                    <p className="mt-4 text-xs text-slate-500 italic text-center">
                      {t("book.slotStrategyInfo", {
                        strategy: slotStrategy,
                        defaultValue: "طريقة اختيار الأوقات: {strategy}",
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Personal Info */}
        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
            <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-2 h-6 rounded-full bg-amber-500"></div>
              {t("book.personalInfo", { defaultValue: "المعلومات الشخصية" })}
            </h4>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("book.name", { defaultValue: "الاسم الكامل" })} *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 transition-all duration-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none"
                  placeholder={t("book.namePlaceholder", {
                    defaultValue: "أدخل اسمك الكامل",
                  })}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-rose-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("book.phone", { defaultValue: "رقم الجوال" })} *
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 transition-all duration-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none"
                  placeholder="+9665XXXXXXXX"
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-rose-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("book.email", { defaultValue: "البريد الإلكتروني" })}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 transition-all duration-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none"
                  placeholder="example@email.com"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-rose-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("book.notes", { defaultValue: "ملاحظات إضافية" })}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 transition-all duration-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none resize-none"
                  placeholder={t("book.notesPlaceholder", {
                    defaultValue: "أي ملاحظات أو متطلبات خاصة...",
                  })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation (before submit) */}
        {currentStep === 3 && !confirmation && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
            <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-2 h-6 rounded-full bg-amber-500"></div>
              {t("book.confirmBooking", { defaultValue: "تأكيد الحجز" })}
            </h4>

            <div className="bg-slate-50 rounded-2xl p-6 mb-6">
              <h5 className="font-semibold text-slate-800 mb-4">
                تفاصيل الحجز
              </h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">الخدمة:</span>
                  <p className="font-medium text-slate-800">
                    {selectedService?.name ||
                      selectedService?.label ||
                      "الخدمة"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">التاريخ:</span>
                  <p className="font-medium text-slate-800">
                    {selectedDate?.toLocaleDateString(slotLocale, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">الوقت:</span>
                  <p className="font-medium text-slate-800">
                    {formatSlotLabel(selectedTime, slotLocale)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">المدة:</span>
                  <p className="font-medium text-slate-800">
                    {formatDurationLabel(
                      selectedService?.duration_minutes,
                      t
                    )}
                  </p>
                </div>
              </div>
            </div>
            {selectedServicePriceLabel && (
              <div className="mt-4 text-sm text-slate-600">
                <span className="text-slate-500">
                  {t("book.detail.price", {
                    defaultValue: "Price:",
                  })}
                </span>
                <div className="mt-1 flex items-center gap-2 font-medium text-slate-800">
                  <RiyalIcon size={16} />
                  <span>{selectedServicePriceLabel}</span>
                </div>
                {selectedServiceOriginalPriceLabel && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-400 line-through">
                    <RiyalIcon size={12} />
                    <span>{selectedServiceOriginalPriceLabel}</span>
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-slate-500 text-center mb-6">
              {t("book.termsNote", {
                defaultValue:
                  "بالنقر على 'تأكيد الحجز'، فإنك توافق على شروط الخدمة وسياسة الخصوصية.",
              })}
            </div>
          </div>
        )}

        {formError && (
          <div className="max-w-2xl mx-auto text-sm text-rose-600 mb-4 flex items-center gap-2">
            <span>⚠️</span>
            {formError}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-12 max-w-2xl mx-auto">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`
              px-6 py-3 rounded-xl font-medium transition-all duration-300
              ${
                currentStep === 1
                  ? "text-slate-400 cursor-not-allowed"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              }
            `}
          >
            {t("book.previous", { defaultValue: "السابق" })}
          </button>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!selectedService || !selectedDate || !selectedTime}
              className={`
                px-8 py-3 rounded-xl font-semibold transition-all duration-300
                ${
                  !selectedService || !selectedDate || !selectedTime
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-amber-500 text-white hover:bg-amber-600 shadow-lg hover:shadow-xl"
                }
              `}
            >
              {t("book.next", { defaultValue: "التالي" })}
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300
                bg-emerald-500 hover:bg-emerald-600 shadow-lg hover:shadow-xl
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-2
              "
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t("book.booking", { defaultValue: "جاري الحجز..." })}
                </>
              ) : (
                t("book.confirm", { defaultValue: "تأكيد الحجز" })
              )}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
