import { motion } from 'framer-motion';
import {
  User, Bell, Palette, Shield, Database, ChevronRight,
  Trash2, LogOut, Mail, Save, Loader2, Languages
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';

export function SettingsPage() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { t, lang, setLang } = useT();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({
    'Push Notifications': true,
    'Email Digest': false,
    'AI Updates': true,
  });

  const handleToggle = (label: string) => {
    setToggleStates(prev => ({ ...prev, [label]: !prev[label] }));
    toast.success(`${label} ${!toggleStates[label] ? 'enabled' : 'disabled'}`);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await updateProfile({ full_name: fullName });
      if (error) {
        toast.error('Failed to update profile');
      } else {
        toast.success('Profile updated successfully!');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
    }
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion is not available yet. Please contact support.');
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </motion.div>

      {/* Settings sections */}
      <div className="space-y-6">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border/50 flex items-center gap-3">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Profile</h2>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="input-glass w-full max-w-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{user?.email}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="btn-primary flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </motion.button>
          </div>
        </motion.div>

        {/* Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border/50 flex items-center gap-3">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Preferences</h2>
          </div>

          <div className="divide-y divide-border/50">
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">Dark mode is enabled by default</p>
              </div>
              <span className="text-sm text-muted-foreground">Dark</span>
            </div>
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Language</p>
                <p className="text-sm text-muted-foreground">Select your preferred language</p>
              </div>
              <span className="text-sm text-muted-foreground">English</span>
            </div>
          </div>
        </motion.div>

        {/* Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border/50 flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Notifications</h2>
          </div>

          <div className="divide-y divide-border/50">
            {[
              { label: 'Push Notifications', description: 'Enable desktop notifications' },
              { label: 'Email Digest', description: 'Weekly summary emails' },
              { label: 'AI Updates', description: 'Notify when AI review completes' },
            ].map((item) => (
              <div key={item.label} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <button
                  onClick={() => handleToggle(item.label)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    toggleStates[item.label] ? 'bg-primary' : 'bg-secondary'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
                      toggleStates[item.label] ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Privacy Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border/50 flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Privacy & Security</h2>
          </div>

          <div className="divide-y divide-border/50">
            <motion.div
              whileHover={{ x: 4 }}
              className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-secondary/30"
            >
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-muted-foreground">Update your password</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </motion.div>
            <motion.div
              whileHover={{ x: 4 }}
              onClick={handleLogout}
              className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-secondary/30"
            >
              <div>
                <p className="font-medium">Sign Out</p>
                <p className="text-sm text-muted-foreground">Sign out of your account</p>
              </div>
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </div>
        </motion.div>

        {/* Data Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border/50 flex items-center gap-3">
            <Database className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Data</h2>
          </div>

          <div className="divide-y divide-border/50">
            <motion.div
              whileHover={{ x: 4 }}
              onClick={handleDeleteAccount}
              className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-destructive/10"
            >
              <div>
                <p className="font-medium text-destructive">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently delete your account</p>
              </div>
              <Trash2 className="w-5 h-5 text-destructive" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* App info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center text-sm text-muted-foreground"
      >
         <p>P-Note v1.0.0</p>
        <p className="mt-1">© 2024 YouAsas. All rights reserved.</p>
      </motion.div>
    </div>
  );
}
