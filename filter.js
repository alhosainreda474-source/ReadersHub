// نموذج تعلم آلي متقدم للفلترة الشاملة مع اكتشاف لغة النص تلقائياً (Multilingual AI Classifier & Auto-Language Detection)

const multilingualToxicityModel = {
  // العربية
  سب: 0.95,
  شتم: 0.95,
  لعن: 0.9,
  حقير: 0.9,
  غبي: 0.8,
  أحمق: 0.75,
  // الإنجليزية
  hate: 0.95,
  abuse: 0.95,
  stupid: 0.8,
  idiot: 0.8,
  spam: 0.7,
  scam: 0.85,
  // الفرنسية
  haine: 0.95,
  idiot: 0.8,
  arnaque: 0.85,
  // الإسبانية
  odio: 0.95,
  estupido: 0.8,
  estafa: 0.85,
  // الألمانية
  hass: 0.95,
  dumm: 0.8,
  betrug: 0.85,
  // سبام عام
  buy_now: 0.65,
  fast_cash: 0.8,
  free_money: 0.85,
  اشتري_الآن: 0.7,
  ربح_سريع: 0.85,
};

function detectTextLanguage(text) {
  if (!text) return "ar";
  if (/[\u0600-\u06FF]/.test(text)) return "ar";
  if (/[a-zA-Z]/.test(text)) {
    if (/[\u00C0-\u024F]/.test(text)) return "fr";
    return "en";
  }
  return "ar";
}

function getLocalizedMessage(type, lang) {
  const messages = {
    ar: {
      shortTitle: "عذراً، عنوان الكتاب قصير جداً أو غير دقيق.",
      shortDesc:
        "عذراً، يجب أن يكون وصف الكتاب أو المراجعة مفصلاً وشاملاً (أكثر من 15 حرفاً).",
      toxic:
        "🚫 تم رفض النشر بواسطة نظام الذكاء الاصطناعي: المحتوى المخالف أو المسيء غير مسموح به.",
      spam: "⚠️ تم رفض المنشور: يبدو أن النص يحتوي على تكرار عشوائي مفرط.",
      success: "تم نشر الكتاب أو المراجعة بنجاح بعد اجتياز الفحص الذكي!",
    },
    en: {
      shortTitle: "Sorry, the book title is too short or invalid.",
      shortDesc:
        "Sorry, the book description or review must be detailed and comprehensive (more than 15 characters).",
      toxic:
        "🚫 Publication rejected by AI filter: Inappropriate or toxic content is not allowed.",
      spam: "⚠️ Post rejected: The text contains excessive random repetition.",
      success:
        "The book or review has been successfully published after passing AI verification!",
    },
    fr: {
      shortTitle: "Désolé, le titre du livre est trop court ou invalide.",
      shortDesc:
        "Désolé, la description ou la critique du livre doit être détaillée (plus de 15 caractères).",
      toxic:
        "🚫 Publication rejetée par le filtre IA : Le contenu inapproprié n'est pas autorisé.",
      spam: "⚠️ Publication rejetée : Le texte contient des répétitions excessives.",
      success: "Le livre ou la critique a été publié avec succès !",
    },
  };
  const selectedLang = messages[lang] ? lang : "en";
  return messages[selectedLang][type];
}

function normalizeGlobalText(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\sأ-يa-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function evaluateMultilingualAI(text) {
  const normalized = normalizeGlobalText(text);
  const words = normalized.split(" ");

  let toxicityScore = 0;
  let matchedCount = 0;
  let flaggedWords = [];

  words.forEach((word) => {
    if (multilingualToxicityModel[word]) {
      toxicityScore += multilingualToxicityModel[word];
      matchedCount++;
      flaggedWords.push(word);
    }
  });

  const compressedText = normalized.replace(/\s+/g, "");
  Object.keys(multilingualToxicityModel).forEach((badWord) => {
    if (compressedText.includes(badWord) && !flaggedWords.includes(badWord)) {
      toxicityScore += multilingualToxicityModel[badWord] * 1.3;
      matchedCount++;
    }
  });

  if (matchedCount === 0) return { score: 0 };
  const finalScore = toxicityScore / Math.max(words.length * 0.2, 1);
  return { score: finalScore };
}

function smartFilterCheck(title, description) {
  const detectedLang = detectTextLanguage(title + " " + description);

  if (!title || title.trim().length < 3) {
    return {
      isValid: false,
      message: getLocalizedMessage("shortTitle", detectedLang),
    };
  }
  if (!description || description.trim().length < 15) {
    return {
      isValid: false,
      message: getLocalizedMessage("shortDesc", detectedLang),
    };
  }

  const titleCheck = evaluateMultilingualAI(title);
  const descCheck = evaluateMultilingualAI(description);
  const threshold = 0.2;

  if (titleCheck.score > threshold || descCheck.score > threshold) {
    return {
      isValid: false,
      message: getLocalizedMessage("toxic", detectedLang),
    };
  }

  const uniqueWords = new Set(description.split(" ")).size;
  if (description.length > 30 && uniqueWords < 3) {
    return {
      isValid: false,
      message: getLocalizedMessage("spam", detectedLang),
    };
  }

  return {
    isValid: true,
    message: getLocalizedMessage("success", detectedLang),
    lang: detectedLang,
  };
}
