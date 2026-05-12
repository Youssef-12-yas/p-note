import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export type Lang = 'ar' | 'en';

const dict = {
  // Common
  'common.cancel': { ar: 'إلغاء', en: 'Cancel' },
  'common.save': { ar: 'حفظ', en: 'Save' },
  'common.delete': { ar: 'حذف', en: 'Delete' },
  'common.create': { ar: 'إنشاء', en: 'Create' },
  'common.creating': { ar: 'جاري الإنشاء...', en: 'Creating...' },
  'common.search': { ar: 'بحث...', en: 'Search...' },
  'common.loading': { ar: 'جارٍ التحميل...', en: 'Loading...' },
  'common.back': { ar: 'رجوع', en: 'Back' },

  // Sidebar / Nav
  'nav.dashboard': { ar: 'الرئيسية', en: 'Dashboard' },
  'nav.groups': { ar: 'المجموعات', en: 'Groups' },
  'nav.aiReview': { ar: 'مراجعة AI', en: 'AI Review' },
  'nav.profile': { ar: 'الملف الشخصي', en: 'Profile' },
  'nav.settings': { ar: 'الإعدادات', en: 'Settings' },
  'nav.newGroup': { ar: 'مجموعة جديدة', en: 'New Group' },
  'nav.signOut': { ar: 'تسجيل الخروج', en: 'Sign Out' },
  'nav.openMenu': { ar: 'فتح القائمة', en: 'Open menu' },

  // Dashboard
  'dash.morning': { ar: 'صباح الخير', en: 'Good morning' },
  'dash.afternoon': { ar: 'مساء الخير', en: 'Good afternoon' },
  'dash.evening': { ar: 'مساء الخير', en: 'Good evening' },
  'dash.subtitle': { ar: 'مستعد لتوسيع معرفتك اليوم؟', en: 'Ready to expand your knowledge today?' },
  'dash.totalGroups': { ar: 'إجمالي المجموعات', en: 'Total Groups' },
  'dash.totalNotes': { ar: 'إجمالي الملاحظات', en: 'Total Notes' },
  'dash.aiReviews': { ar: 'مراجعات الذكاء', en: 'AI Reviews' },
  'dash.quickActions': { ar: 'إجراءات سريعة', en: 'Quick Actions' },
  'dash.yourGroups': { ar: 'مجموعاتك', en: 'Your Groups' },
  'dash.viewAll': { ar: 'عرض الكل', en: 'View all' },
  'dash.recentNotes': { ar: 'أحدث الملاحظات', en: 'Recent Notes' },
  'dash.noGroups': { ar: 'لا توجد مجموعات بعد', en: 'No groups yet' },
  'dash.noNotes': { ar: 'لا توجد ملاحظات بعد', en: 'No notes yet' },
  'dash.createFirst': { ar: 'أنشئ مجموعتك الأولى', en: 'Create your first group' },
  'dash.aiInsight': { ar: 'رؤية ذكية', en: 'AI Insight' },
  'dash.lessons': { ar: 'دروس', en: 'lessons' },
  'dash.notes': { ar: 'ملاحظات', en: 'notes' },

  // Groups page
  'groups.title': { ar: 'المجموعات', en: 'Groups' },
  'groups.subtitle': { ar: 'نظّم مساحات تعلّمك', en: 'Organize your learning spaces' },
  'groups.searchPlaceholder': { ar: 'ابحث في المجموعات...', en: 'Search groups...' },
  'groups.newGroup': { ar: 'مجموعة جديدة', en: 'New Group' },
  'groups.notFound': { ar: 'لم يتم العثور على مجموعات', en: 'No groups found' },
  'groups.tryDifferent': { ar: 'جرّب مصطلح بحث آخر', en: 'Try a different search term' },
  'groups.startHint': { ar: 'أنشئ أول مجموعة لتبدأ', en: 'Create your first group to get started' },
  'groups.createGroup': { ar: 'إنشاء مجموعة', en: 'Create Group' },
  'groups.createNewGroup': { ar: 'إنشاء مجموعة جديدة', en: 'Create New Group' },
  'groups.icon': { ar: 'الأيقونة', en: 'Icon' },
  'groups.name': { ar: 'اسم المجموعة', en: 'Group Name' },
  'groups.namePlaceholder': { ar: 'مثال: إتقان JavaScript', en: 'e.g., JavaScript Mastery' },
  'groups.description': { ar: 'الوصف', en: 'Description' },
  'groups.descriptionPlaceholder': { ar: 'ماذا ستتعلم في هذه المجموعة؟', en: 'What will you learn in this group?' },
  'groups.confirmDelete': { ar: 'هل أنت متأكد من حذف هذه المجموعة؟ سيتم حذف كل الدروس والملاحظات.', en: 'Are you sure you want to delete this group? All lessons and notes will be deleted.' },
  'groups.noDescription': { ar: 'لا يوجد وصف', en: 'No description' },

  // Group detail
  'lesson.backToGroups': { ar: 'العودة إلى المجموعات', en: 'Back to Groups' },
  'lesson.searchPlaceholder': { ar: 'ابحث في الدروس...', en: 'Search lessons...' },
  'lesson.newLesson': { ar: 'درس جديد', en: 'New Lesson' },
  'lesson.createLesson': { ar: 'إنشاء درس', en: 'Create Lesson' },
  'lesson.createNew': { ar: 'إنشاء درس جديد', en: 'Create New Lesson' },
  'lesson.name': { ar: 'اسم الدرس', en: 'Lesson Name' },
  'lesson.namePlaceholder': { ar: 'مثال: مقدمة في React', en: 'e.g., Intro to React' },
  'lesson.none': { ar: 'لا توجد دروس بعد', en: 'No lessons yet' },
  'lesson.createFirst': { ar: 'أنشئ أول درس لتبدأ التعلم', en: 'Create your first lesson to start learning' },
  'lesson.confirmDelete': { ar: 'هل أنت متأكد من حذف هذا الدرس؟ سيتم حذف كل الملاحظات.', en: 'Are you sure you want to delete this lesson? All notes will be deleted.' },
  'lesson.aiContent': { ar: 'محتوى تعليمي بالذكاء الاصطناعي', en: 'AI Learning Content' },
  'lesson.yourNotes': { ar: 'ملاحظاتك', en: 'Your Notes' },
  'lesson.noNotesYet': { ar: 'لا توجد ملاحظات بعد. أضف ملاحظتك الأولى!', en: 'No notes yet. Add your first note!' },
  'lesson.addNote': { ar: 'إضافة ملاحظة', en: 'Add Note' },
  'lesson.notesCount': { ar: 'ملاحظات', en: 'notes' },
  'lesson.aiBadge': { ar: 'ذكاء', en: 'AI' },
  'lesson.aiTooltip': { ar: 'إنشاء ملخص بالذكاء الاصطناعي', en: 'Generate AI Summary' },
  'lesson.addNotesFirst': { ar: 'أضف بعض الملاحظات أولاً قبل توليد محتوى الذكاء الاصطناعي.', en: 'Please add some notes first before generating AI content.' },
  'lesson.notFound': { ar: 'المجموعة غير موجودة', en: 'Group not found' },

  // Settings
  'settings.title': { ar: 'الإعدادات', en: 'Settings' },
  'settings.subtitle': { ar: 'إدارة حسابك وتفضيلاتك', en: 'Manage your account and preferences' },
  'settings.profile': { ar: 'الملف الشخصي', en: 'Profile' },
  'settings.fullName': { ar: 'الاسم الكامل', en: 'Full Name' },
  'settings.email': { ar: 'البريد الإلكتروني', en: 'Email' },
  'settings.saveChanges': { ar: 'حفظ التغييرات', en: 'Save Changes' },
  'settings.preferences': { ar: 'التفضيلات', en: 'Preferences' },
  'settings.language': { ar: 'اللغة', en: 'Language' },
  'settings.languageHint': { ar: 'اختر لغتك المفضلة', en: 'Choose your preferred language' },
  'settings.theme': { ar: 'المظهر', en: 'Theme' },
  'settings.themeHint': { ar: 'الوضع الداكن مفعّل افتراضياً', en: 'Dark mode is enabled by default' },
  'settings.dark': { ar: 'داكن', en: 'Dark' },
} as const;

type Key = keyof typeof dict;

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Key) => string;
  dir: 'rtl' | 'ltr';
}

const LangContext = createContext<LangCtx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('ynote-lang');
    return saved === 'en' || saved === 'ar' ? saved : 'ar';
  });

  const dir: 'rtl' | 'ltr' = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = (l: Lang) => {
    localStorage.setItem('ynote-lang', l);
    setLangState(l);
  };

  const value = useMemo<LangCtx>(() => ({
    lang,
    setLang,
    dir,
    t: (k: Key) => dict[k]?.[lang] ?? String(k),
  }), [lang, dir]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useT() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useT must be used inside LanguageProvider');
  return ctx;
}
