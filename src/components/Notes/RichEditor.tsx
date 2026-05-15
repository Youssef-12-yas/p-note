import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Markdown } from 'tiptap-markdown';
import { motion } from 'framer-motion';
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Undo2,
  Redo2,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

interface RichEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function RichEditor({ value, onChange, placeholder, autoFocus }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: placeholder || '' }),
      Link.configure({ openOnClick: false, autolink: true }),
      Markdown.configure({ html: false, linkify: true, breaks: true, transformPastedText: true }),
    ],
    content: value || '',
    autofocus: autoFocus ? 'end' : false,
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-3xl mx-auto focus:outline-none min-h-[60vh] text-[17px] sm:text-lg leading-8 tracking-[0.005em] py-2',
      },
    },
    onUpdate({ editor }) {
      const md = (editor.storage as any).markdown.getMarkdown();
      onChange(md);
    },
  });

  // Sync external value (only when truly different to avoid cursor jumps)
  const lastEmitted = useRef(value);
  useEffect(() => {
    if (!editor) return;
    if (value === lastEmitted.current) return;
    const current = (editor.storage as any).markdown.getMarkdown();
    if (current !== value) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
    lastEmitted.current = value;
  }, [value, editor]);

  if (!editor) return null;

  const Btn = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        active ? 'bg-primary/15 text-primary' : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </motion.button>
  );

  return (
    <div className="flex flex-col flex-1">
      <div className="glass rounded-xl p-2 flex items-center gap-1 mb-4 overflow-x-auto sticky top-2 z-10">
        <Btn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <BoldIcon className="w-4 h-4" />
        </Btn>
        <Btn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <ItalicIcon className="w-4 h-4" />
        </Btn>
        <Btn
          title="Heading 1"
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="w-4 h-4" />
        </Btn>
        <Btn
          title="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="w-4 h-4" />
        </Btn>
        <Btn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-4 h-4" />
        </Btn>
        <Btn title="Ordered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-4 h-4" />
        </Btn>
        <Btn title="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="w-4 h-4" />
        </Btn>
        <Btn title="Code" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code className="w-4 h-4" />
        </Btn>
        <Btn
          title="Link"
          active={editor.isActive('link')}
          onClick={() => {
            const url = window.prompt('URL');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          <Link2 className="w-4 h-4" />
        </Btn>
        <div className="mx-1 h-5 w-px bg-border/60" />
        <Btn title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="w-4 h-4" />
        </Btn>
        <Btn title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="w-4 h-4" />
        </Btn>
      </div>

      <EditorContent editor={editor} className="flex-1 overflow-auto px-1" />
    </div>
  );
}
