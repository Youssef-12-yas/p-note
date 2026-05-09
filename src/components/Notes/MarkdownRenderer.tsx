import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const renderedContent = useMemo(() => {
    if (!content) return '';

    let html = content;

    // Code blocks with syntax highlighting style
    html = html.replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      (_, lang, code) => {
        const langLabel = lang ? `<span class="code-lang">${lang}</span>` : '';
        return `<div class="code-block">${langLabel}<pre><code>${escapeHtml(code.trim())}</code></pre></div>`;
      }
    );

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>'
    );

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote class="md-quote">$1</blockquote>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr class="md-hr" />');

    // Lists
    html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="md-oli">$2</li>');
    html = html.replace(/^- (.+)$/gm, '<li class="md-uli">$1</li>');

    // Wrap consecutive list items
    html = html.replace(
      /(<li class="md-uli">[\s\S]*?<\/li>(\n)?)+/g,
      '<ul class="md-ul">$&</ul>'
    );
    html = html.replace(
      /(<li class="md-oli">[\s\S]*?<\/li>(\n)?)+/g,
      '<ol class="md-ol">$&</ol>'
    );

    // Paragraphs - wrap remaining text blocks
    html = html
      .split('\n\n')
      .map((block) => {
        if (
          block.startsWith('<h') ||
          block.startsWith('<ul') ||
          block.startsWith('<ol') ||
          block.startsWith('<blockquote') ||
          block.startsWith('<div') ||
          block.startsWith('<hr') ||
          block.trim() === ''
        ) {
          return block;
        }
        return `<p class="md-p">${block.replace(/\n/g, '<br />')}</p>`;
      })
      .join('\n');

    return html;
  }, [content]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
