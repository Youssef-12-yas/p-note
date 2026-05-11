import { useRef, useState } from 'react';
import { Camera, Loader2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AvatarUploadProps {
  size?: number;
}

export function AvatarUpload({ size = 120 }: AvatarUploadProps) {
  const { user, profile, updateProfile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const initials = (profile?.full_name || user?.email || '?').slice(0, 2).toUpperCase();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة أقل من 5 ميجابايت');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('يجب اختيار صورة');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, cacheControl: '3600' });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = data.publicUrl;

      const { error: profErr } = await updateProfile({ avatar_url: url });
      if (profErr) throw profErr;
      toast.success('تم تحديث الصورة الشخصية');
    } catch (err: any) {
      toast.error(err.message || 'فشل رفع الصورة');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center group ring-2 ring-border/40 hover:ring-primary/60 transition-all"
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl font-bold text-foreground/80">{initials}</span>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      </motion.button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
