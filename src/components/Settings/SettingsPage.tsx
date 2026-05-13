import { motion } from 'framer-motion';
import {
  User, Bell, Palette, Shield, Database, ChevronRight,
  Trash2, LogOut, Mail, Save, Loader2, Languages
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';
import { SEO } from '@/components/SEO';
import { PasswordChangeModal } from './PasswordChangeModal';

export function SettingsPage() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { t, lang, setLang } = useT();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);

  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({
    push: true,
    email: false,
    ai: true,
  });

  const handleToggle = (key: string) => {
    setToggleStates(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await updateProfile({ full_name: fullName });
      if (error) toast.error(t('settings.profileError'));
      else toast.success(t('settings.profileUpdated'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (confirm(t('settings.signOutConfirm'))) await signOut();
  };

  const handleDeleteAccount = () => {
    toast.error(lang === 'ar' ? 'حذف الحساب غير متاح حالياً.' : 'Account deletion is not available yet.');
  };

  const notificationItems = [
    { key: 'push', label: t('settings.notifPush'), description: t('settings.notifPushHint') },
    { key: 'email', label: t('settings.notifEmail'), description: t('settings.notifEmailHint') },
    { key: 'ai', label: t('settings.notifAi'), description: t('settings.notifAiHint') },
  ];

  return (
    <div>
      <SEO title="Settings | P-Note" description="Manage your P-Note account, language (English / Arabic), notifications, and preferences." path="/settings" />
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </motion.div>

      <div className="space-y-6">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 flex items-center gap-3">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">{t('settings.profile')}</h2>
          </div>
          <div className="p-4 md:p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('settings.fullName')}</label>
              <input
                type="text" value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('settings.fullName')}
                className="input-glass w-full max-w-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('settings.email')}</label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground break-all" dir="ltr">{user?.email}</span>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }} onClick={handleSaveProfile} disabled={isSaving}
              className="btn-primary flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {t('settings.saveChanges')}
            </motion.button>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-border/50 flex items-center gap-3">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">{t('settings.preferences')}</h2>
          </div>
          <div className="divide-y divide-border/50">
            <div className="px-4 md:px-6 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{t('settings.theme')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.themeHint')}</p>
              </div>
              <span className="text-sm text-muted-foreground shrink-0">{t('settings.dark')}</span>
            </div>
            <div className="px-4 md:px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex items-center gap-3">
                <Languages className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="font-medium">{t('settings.language')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.languageHint')}</p>
                </div>
              </div>
              <div className="inline-flex rounded-xl bg-secondary/60 p-1 text-sm shrink-0">
                <button
                  onClick={() => setLang('ar')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${lang === 'ar' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  العربية
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">{t('settings.notifications')}</h2>
          </div>
          <div className="divide-y divide-border/50">
            {notificationItems.map((item) => (
              <div key={item.key} className="px-6 py-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <button
                  onClick={() => handleToggle(item.key)}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${toggleStates[item.key] ? 'bg-primary' : 'bg-secondary'}`}
                  aria-label={item.label}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${toggleStates[item.key] ? 'start-6' : 'start-0.5'}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Privacy */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">{t('settings.privacy')}</h2>
          </div>
          <div className="divide-y divide-border/50">
            <button
              onClick={() => setShowPwdModal(true)}
              className="w-full px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-secondary/30 text-start"
            >
              <div>
                <p className="font-medium">{t('settings.changePassword')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.changePasswordHint')}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground rtl:rotate-180" />
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-secondary/30 text-start"
            >
              <div>
                <p className="font-medium">{t('settings.signOut')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.signOutHint')}</p>
              </div>
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </motion.div>

        {/* Data */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 flex items-center gap-3">
            <Database className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">{t('settings.data')}</h2>
          </div>
          <div className="divide-y divide-border/50">
            <button
              onClick={handleDeleteAccount}
              className="w-full px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-destructive/10 text-start"
            >
              <div>
                <p className="font-medium text-destructive">{t('settings.deleteAccount')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.deleteAccountHint')}</p>
              </div>
              <Trash2 className="w-5 h-5 text-destructive" />
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 text-center text-sm text-muted-foreground">
        <p>P-Note v1.0.0</p>
        <p className="mt-1">© 2024 YouAsas. All rights reserved.</p>
      </motion.div>

      <PasswordChangeModal open={showPwdModal} onClose={() => setShowPwdModal(false)} />
    </div>
  );
}
