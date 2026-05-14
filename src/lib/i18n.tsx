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
  'settings.notifications': { ar: 'الإشعارات', en: 'Notifications' },
  'settings.notifPush': { ar: 'إشعارات فورية', en: 'Push Notifications' },
  'settings.notifPushHint': { ar: 'تفعيل إشعارات سطح المكتب', en: 'Enable desktop notifications' },
  'settings.notifEmail': { ar: 'ملخص البريد', en: 'Email Digest' },
  'settings.notifEmailHint': { ar: 'ملخص أسبوعي عبر البريد', en: 'Weekly summary emails' },
  'settings.notifAi': { ar: 'تحديثات الذكاء', en: 'AI Updates' },
  'settings.notifAiHint': { ar: 'إشعار عند انتهاء مراجعة AI', en: 'Notify when AI review completes' },
  'settings.privacy': { ar: 'الخصوصية والأمان', en: 'Privacy & Security' },
  'settings.changePassword': { ar: 'تغيير كلمة المرور', en: 'Change Password' },
  'settings.changePasswordHint': { ar: 'حدّث كلمة المرور الخاصة بك', en: 'Update your password' },
  'settings.signOut': { ar: 'تسجيل الخروج', en: 'Sign Out' },
  'settings.signOutHint': { ar: 'تسجيل الخروج من حسابك', en: 'Sign out of your account' },
  'settings.signOutConfirm': { ar: 'هل أنت متأكد من تسجيل الخروج؟', en: 'Are you sure you want to sign out?' },
  'settings.data': { ar: 'البيانات', en: 'Data' },
  'settings.deleteAccount': { ar: 'حذف الحساب', en: 'Delete Account' },
  'settings.deleteAccountHint': { ar: 'حذف الحساب نهائياً', en: 'Permanently delete your account' },
  'settings.profileUpdated': { ar: 'تم تحديث الملف الشخصي بنجاح!', en: 'Profile updated successfully!' },
  'settings.profileError': { ar: 'فشل تحديث الملف الشخصي', en: 'Failed to update profile' },
  'pwd.current': { ar: 'كلمة المرور الحالية', en: 'Current password' },
  'pwd.new': { ar: 'كلمة المرور الجديدة', en: 'New password' },
  'pwd.confirm': { ar: 'تأكيد كلمة المرور', en: 'Confirm password' },
  'pwd.update': { ar: 'تحديث كلمة المرور', en: 'Update password' },
  'pwd.mismatch': { ar: 'كلمتا المرور غير متطابقتين', en: 'Passwords do not match' },
  'pwd.tooShort': { ar: 'كلمة المرور قصيرة جداً (٦ أحرف على الأقل)', en: 'Password too short (min 6 chars)' },
  'pwd.success': { ar: 'تم تحديث كلمة المرور بنجاح', en: 'Password updated successfully' },

  // Auth page
  'auth.signIn': { ar: 'تسجيل الدخول', en: 'Sign In' },
  'auth.signUp': { ar: 'إنشاء حساب', en: 'Sign Up' },
  'auth.welcomeBack': { ar: 'مرحباً بعودتك', en: 'Welcome back' },
  'auth.createAccount': { ar: 'إنشاء حساب', en: 'Create account' },
  'auth.enterCreds': { ar: 'أدخل بياناتك للمتابعة', en: 'Enter your credentials to continue' },
  'auth.startJourney': { ar: 'ابدأ رحلتك مع P-Note', en: 'Start your journey with P-Note' },
  'auth.fullName': { ar: 'الاسم الكامل', en: 'Full Name' },
  'auth.namePlaceholder': { ar: 'اسمك الكامل', en: 'John Doe' },
  'auth.email': { ar: 'البريد الإلكتروني', en: 'Email' },
  'auth.password': { ar: 'كلمة المرور', en: 'Password' },
  'auth.minChars': { ar: 'يجب ألا تقل عن ٦ أحرف', en: 'Password must be at least 6 characters' },
  'auth.submitSignIn': { ar: 'تسجيل الدخول', en: 'Sign In' },
  'auth.submitSignUp': { ar: 'إنشاء حساب', en: 'Create Account' },
  'auth.heroTitle1': { ar: 'رفيقك الذكي', en: 'Your AI-powered' },
  'auth.heroTitle2': { ar: 'في التفكير والتعلم', en: 'thinking companion' },
  'auth.heroDesc': {
    ar: 'نظّم معرفتك، تحقق من أفكارك، وتطور فكرياً بقوة الذكاء الاصطناعي.',
    en: 'Organize your knowledge, validate your ideas, and grow intellectually with the power of AI.',
  },
  'auth.feat1': { ar: 'تنظيم ذكي للملاحظات', en: 'Smart note organization' },
  'auth.feat2': { ar: 'مراجعات بالذكاء الاصطناعي', en: 'AI-powered reviews' },
  'auth.feat3': { ar: 'توسيع المعرفة', en: 'Knowledge expansion' },
  'auth.terms': { ar: 'بمتابعتك فأنت توافق على شروط الخدمة وسياسة الخصوصية', en: 'By continuing, you agree to our Terms and Privacy Policy' },
  'auth.signupSuccess': { ar: 'تم إنشاء الحساب! تحقق من بريدك لتفعيله.', en: 'Account created! Please check your email to verify your account.' },
  'auth.unexpected': { ar: 'حدث خطأ غير متوقع', en: 'An unexpected error occurred' },

  // Onboarding language picker
  'onb.pickLang': { ar: 'اختر لغتك', en: 'Choose your language' },
  'onb.pickLangSub': { ar: 'يمكنك تغييرها لاحقاً من الإعدادات', en: 'You can change this later in Settings' },
  'onb.continue': { ar: 'متابعة', en: 'Continue' },
  'onb.skip': { ar: 'تخطي', en: 'Skip' },
  'onb.getStarted': { ar: 'لنبدأ', en: 'Get Started' },
  'onb.discover': { ar: 'اكتشف المستقبل', en: 'Discover the future' },
  'onb.tagline': { ar: 'فكّر بذكاء. اكتب بعمق.', en: 'Think smarter. Write deeper.' },
  'onb.heroTitle': { ar: 'P-Note — رفيقك الذكي للتفكير', en: 'P-Note — AI-powered thinking companion' },
  'onb.s1.title': { ar: 'فكّر بعمق', en: 'Think Deeper' },
  'onb.s1.sub': { ar: 'أفكارك تستحق الذكاء', en: 'Your ideas deserve intelligence' },
  'onb.s1.desc': { ar: 'P-Note رفيقك الذكي الذي يساعدك على تنظيم معرفتك والتحقق منها وتوسيعها.', en: 'P-Note is your AI-powered thinking companion that helps you organize, validate, and expand your knowledge.' },
  'onb.s2.title': { ar: 'الذكاء يفهم', en: 'AI Understands' },
  'onb.s2.sub': { ar: 'أكثر من مجرد ملاحظات', en: 'More than just notes' },
  'onb.s2.desc': { ar: 'يقرأ الذكاء الاصطناعي محتواك ويكتشف الأنماط والروابط وفرص التحسين.', en: 'Our AI reads and comprehends your content, detecting patterns, connections, and opportunities for improvement.' },
  'onb.s3.title': { ar: 'الذكاء يراجع', en: 'AI Reviews' },
  'onb.s3.sub': { ar: 'مرشدك الشخصي', en: 'Your personal mentor' },
  'onb.s3.desc': { ar: 'احصل على تغذية راجعة فورية. الذكاء يتحقق من المفاهيم ويصحّح الأخطاء ويقترح التحسينات.', en: 'Get instant feedback on your ideas. The AI validates concepts, fixes errors, and suggests enhancements.' },
  'onb.s4.title': { ar: 'الذكاء يوسّع', en: 'AI Expands' },
  'onb.s4.sub': { ar: 'نمِّ فهمك', en: 'Grow your understanding' },
  'onb.s4.desc': { ar: 'اكتشف مفاهيم وشروحات وموارد لم تكن تعرفها.', en: 'Discover related concepts, better explanations, and resources you never knew existed.' },
  'onb.s5.title': { ar: 'ابدأ التعلم', en: 'Start Learning' },
  'onb.s5.sub': { ar: 'هل أنت مستعد؟', en: 'Ready to think smarter?' },
  'onb.s5.desc': { ar: 'انضم إلى آلاف المتعلمين الذين يحوّلون طريقة تفكيرهم.', en: 'Join thousands of learners who are already transforming how they think and learn.' },

  // Note editor
  'note.notFound': { ar: 'الملاحظة غير موجودة', en: 'Note not found' },
  'note.titlePlaceholder': { ar: 'عنوان الملاحظة...', en: 'Note title...' },
  'note.startWriting': { ar: 'ابدأ الكتابة هنا...', en: 'Start writing your notes...' },
  'note.unsaved': { ar: 'لم يُحفظ', en: 'Unsaved' },
  'note.savedAgo': { ar: 'تم الحفظ', en: 'Saved' },
  'note.save': { ar: 'حفظ', en: 'Save' },
  'note.confirmDelete': { ar: 'هل أنت متأكد من حذف هذه الملاحظة؟', en: 'Are you sure you want to delete this note?' },
  'note.aiAnalyzing': { ar: 'تم الحفظ! الذكاء الاصطناعي يحلل ملاحظتك...', en: 'Saved! AI is analyzing your note...' },
  'note.saved': { ar: 'تم حفظ الملاحظة!', en: 'Note saved!' },
  'note.saveFailed': { ar: 'فشل حفظ الملاحظة', en: 'Failed to save note' },
  'note.preview': { ar: 'معاينة', en: 'Preview' },
  'note.edit': { ar: 'تحرير', en: 'Edit' },
  'note.focusMode': { ar: 'وضع التركيز', en: 'Focus mode' },
  'note.exitFocus': { ar: 'الخروج من وضع التركيز', en: 'Exit focus mode' },

  // Product tour
  'tour.skip': { ar: 'تخطي الجولة', en: 'Skip tour' },
  'tour.next': { ar: 'التالي', en: 'Next' },
  'tour.back': { ar: 'السابق', en: 'Back' },
  'tour.done': { ar: 'تم', en: 'Done' },
  'tour.welcome.title': { ar: 'أهلاً بك في P-Note', en: 'Welcome to P-Note' },
  'tour.welcome.desc': { ar: 'جولة سريعة للتعرف على كل الميزات. يمكنك التخطي في أي وقت.', en: 'A quick tour of all the features. You can skip anytime.' },
  'tour.dashboard.title': { ar: 'لوحة التحكم', en: 'Dashboard' },
  'tour.dashboard.desc': { ar: 'ملخّص نشاطك وتقدّمك وآخر ملاحظاتك ومجموعاتك.', en: 'Summary of your activity, latest notes and groups.' },
  'tour.groups.title': { ar: 'المجموعات والدروس', en: 'Groups & Lessons' },
  'tour.groups.desc': { ar: 'نظّم تعلّمك في مجموعات تحتوي دروساً وملاحظات.', en: 'Organize your learning in groups of lessons and notes.' },
  'tour.ai.title': { ar: 'مراجعة الذكاء الاصطناعي', en: 'AI Review' },
  'tour.ai.desc': { ar: 'الذكاء يراجع ملاحظاتك تلقائياً ويوسّع معرفتك.', en: 'AI reviews your notes automatically and expands your knowledge.' },
  'tour.profile.title': { ar: 'ملفك الشخصي', en: 'Your Profile' },
  'tour.profile.desc': { ar: 'تابع مستواك وإحصائيات تعلّمك وضع صورتك.', en: 'Track your level, stats, and add your photo.' },
  'tour.settings.title': { ar: 'الإعدادات', en: 'Settings' },
  'tour.settings.desc': { ar: 'غيّر اللغة وكلمة المرور والتفضيلات.', en: 'Change language, password, and preferences.' },
  'tour.finish.title': { ar: 'كل شيء جاهز!', en: "You're all set!" },
  'tour.finish.desc': { ar: 'استمتع باستخدام P-Note. سنخبرك بأي ميزات جديدة.', en: "Enjoy P-Note. We'll notify you of new features." },
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
