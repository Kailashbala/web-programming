/**
 * Markdown Previewer - Renderer Engine
 * Robust markdown parsing, syntax highlighting, callout alerts, math formulas,
 * and interactive preview interactions.
 */

class MarkdownRenderer {
  constructor() {
    this.katexAvailable = typeof window.katex !== 'undefined';
    this.markedAvailable = typeof window.marked !== 'undefined';
    this.hljsAvailable = typeof window.hljs !== 'undefined';

    this.initMarked();
  }

  /**
   * Configure Marked options and custom token renderers
   */
  initMarked() {
    if (!this.markedAvailable) {
      console.warn('Marked library not found, fallback parser will be used.');
      return;
    }

    // Configure marked options
    window.marked.setOptions({
      gfm: true,
      breaks: true,
      pedantic: false,
      smartypants: true,
    });

    // Custom renderer for code blocks, links, and task items
    const renderer = new window.marked.Renderer();

    // Custom code block renderer with language badge and copy button
    renderer.code = (arg1, arg2) => {
      let code = '';
      let language = '';

      if (typeof arg1 === 'object' && arg1 !== null) {
        code = arg1.text || '';
        language = arg1.lang || '';
      } else {
        code = arg1 || '';
        language = arg2 || '';
      }

      let validLang = (language || '').trim().toLowerCase();
      let highlightedCode = '';

      if (this.hljsAvailable && validLang && window.hljs.getLanguage(validLang)) {
        try {
          highlightedCode = window.hljs.highlight(code, { language: validLang }).value;
        } catch (e) {
          highlightedCode = this.escapeHtml(code);
        }
      } else if (this.hljsAvailable) {
        try {
          const auto = window.hljs.highlightAuto(code);
          highlightedCode = auto.value;
          if (!validLang && auto.language) validLang = auto.language;
        } catch (e) {
          highlightedCode = this.escapeHtml(code);
        }
      } else {
        highlightedCode = this.escapeHtml(code);
      }

      const displayLang = validLang ? validLang : 'text';

      return `
        <div class="code-block-wrapper" data-language="${this.escapeHtml(displayLang)}">
          <div class="code-block-header">
            <span class="code-lang-label">${this.escapeHtml(displayLang)}</span>
            <button class="code-copy-btn" title="Copy code snippet" type="button" aria-label="Copy code">
              <svg class="copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <svg class="check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="copy-text">Copy</span>
            </button>
          </div>
          <pre><code class="hljs language-${this.escapeHtml(displayLang)}">${highlightedCode}</code></pre>
        </div>
      `;
    };

    // Open external links in new tab with security attributes
    renderer.link = (arg1, arg2, arg3) => {
      let href = '';
      let title = '';
      let text = '';

      if (typeof arg1 === 'object' && arg1 !== null) {
        href = arg1.href || '';
        title = arg1.title || '';
        text = arg1.text || '';
      } else {
        href = arg1 || '';
        title = arg2 || '';
        text = arg3 || '';
      }

      const isInternal = href && (href.startsWith('#') || href.startsWith('/'));
      const targetAttr = isInternal ? '' : ' target="_blank" rel="noopener noreferrer"';
      const titleAttr = title ? ` title="${this.escapeHtml(title)}"` : '';
      return `<a href="${href || '#'}"${titleAttr}${targetAttr}>${text}</a>`;
    };

    // Custom table renderer for responsive wrapping
    const defaultTableRenderer = renderer.table.bind(renderer);
    renderer.table = (arg1, arg2) => {
      if (typeof arg1 === 'object' && arg1 !== null && defaultTableRenderer) {
        return `<div class="table-container">${defaultTableRenderer(arg1)}</div>`;
      }
      return `<div class="table-container">${defaultTableRenderer(arg1, arg2)}</div>`;
    };

    // Task list items
    renderer.listitem = (arg1, arg2, arg3) => {
      let text = '';
      let task = false;
      let checked = false;

      if (typeof arg1 === 'object' && arg1 !== null) {
        text = arg1.text || '';
        task = !!arg1.task;
        checked = !!arg1.checked;
      } else {
        text = arg1 || '';
        task = !!arg2;
        checked = !!arg3;
      }

      if (task) {
        return `<li class="task-list-item"><input type="checkbox" class="task-checkbox" ${checked ? 'checked' : ''} /><span>${text}</span></li>`;
      }
      return `<li>${text}</li>`;
    };

    window.marked.use({ renderer });
  }

  /**
   * Process custom alerts/callouts like > [!NOTE]
   */
  processAlerts(html) {
    const alertTypes = {
      NOTE: { icon: 'info', title: 'Note', class: 'alert-note' },
      TIP: { icon: 'lightbulb', title: 'Tip', class: 'alert-tip' },
      IMPORTANT: { icon: 'alert-circle', title: 'Important', class: 'alert-important' },
      WARNING: { icon: 'alert-triangle', title: 'Warning', class: 'alert-warning' },
      CAUTION: { icon: 'flame', title: 'Caution', class: 'alert-caution' }
    };

    const iconsSvg = {
      info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      lightbulb: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/></svg>',
      'alert-circle': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      'alert-triangle': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      flame: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z"/></svg>'
    };

    // Regex to detect blockquotes containing [!TYPE]
    return html.replace(/<blockquote>\s*<p>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s*<br\s*\/?>)?([\s\S]*?)<\/p>([\s\S]*?)<\/blockquote>/gi, (match, type, content, rest) => {
      const upperType = type.toUpperCase();
      const meta = alertTypes[upperType] || alertTypes.NOTE;
      const icon = iconsSvg[meta.icon];
      const remainingRest = rest ? rest.trim() : '';

      return `
        <div class="callout-alert ${meta.class}">
          <div class="callout-header">
            <span class="callout-icon">${icon}</span>
            <span class="callout-title">${meta.title}</span>
          </div>
          <div class="callout-content">
            <p>${content.trim()}</p>
            ${remainingRest}
          </div>
        </div>
      `;
    });
  }

  /**
   * Pre-process mathematical formulas ($...$ and $$...$$)
   * Replacing them with safe unique placeholder tokens before markdown parsing
   */
  preprocessMath(markdown) {
    if (typeof window.katex === 'undefined') {
      return { text: markdown, mathTokens: [] };
    }

    const mathTokens = [];
    let tokenIndex = 0;

    // First handle block/display math $$...$$
    let text = markdown.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
      const placeholder = `%%%MATH_BLOCK_${tokenIndex}%%%`;
      mathTokens.push({ placeholder, formula: formula.trim(), display: true });
      tokenIndex++;
      return placeholder;
    });

    // Then handle inline math $...$
    text = text.replace(/(^|[^\$])\$([^\$\n]+?)\$(?!\$)/g, (match, prefix, formula) => {
      const placeholder = `%%%MATH_INLINE_${tokenIndex}%%%`;
      mathTokens.push({ placeholder, formula: formula.trim(), display: false });
      tokenIndex++;
      return `${prefix}${placeholder}`;
    });

    return { text, mathTokens };
  }

  /**
   * Restore math formulas with KaTeX rendered HTML
   */
  postprocessMath(html, mathTokens) {
    if (!mathTokens || mathTokens.length === 0 || typeof window.katex === 'undefined') {
      return html;
    }

    let result = html;
    for (const token of mathTokens) {
      try {
        const rendered = window.katex.renderToString(token.formula, {
          displayMode: token.display,
          throwOnError: false,
        });
        result = result.replace(token.placeholder, rendered);
      } catch (err) {
        result = result.replace(token.placeholder, `<span class="katex-error">${this.escapeHtml(token.formula)}</span>`);
      }
    }
    return result;
  }

  /**
   * Main render function: transforms raw markdown into sanitized, enriched HTML
   */
  render(markdown) {
    if (!markdown || !markdown.trim()) {
      return '<div class="preview-empty-state"><p>Nothing to preview yet. Start typing in the editor or select a template above.</p></div>';
    }

    // 1. Math extraction
    const { text: processedMarkdown, mathTokens } = this.preprocessMath(markdown);

    let html = '';

    // 2. Parse Markdown
    if (typeof window.marked !== 'undefined') {
      try {
        html = window.marked.parse(processedMarkdown);
      } catch (e) {
        console.error('Marked parsing error:', e);
        html = this.fallbackParse(processedMarkdown);
      }
    } else {
      html = this.fallbackParse(processedMarkdown);
    }

    // 3. Process GitHub-style Alert Callouts
    html = this.processAlerts(html);

    // 4. Restore math
    html = this.postprocessMath(html, mathTokens);

    return html;
  }

  /**
   * Offline / Emergency Regex Fallback Parser (if CDN is unavailable)
   */
  fallbackParse(md) {
    let output = this.escapeHtml(md);

    // Headers
    output = output.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    output = output.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    output = output.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold, Italic, Strikethrough
    output = output.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
    output = output.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    output = output.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    output = output.replace(/~~(.*?)~~/gim, '<del>$1</del>');

    // Blockquotes
    output = output.replace(/^\> (.*$)/gim, '<blockquote><p>$1</p></blockquote>');

    // Code blocks
    output = output.replace(/```([a-z0-9]*)\n([\s\S]*?)```/gim, (match, lang, code) => {
      return `<pre><code class="language-${lang || 'text'}">${code}</code></pre>`;
    });

    // Inline code
    output = output.replace(/`([^`]+)`/gim, '<code>$1</code>');

    // Horizontal Rule
    output = output.replace(/^(?:---|\*\*\*|___)\s*$/gim, '<hr />');

    // Lists
    output = output.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
    output = output.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');

    // Paragraphs
    output = output.replace(/\n\s*\n/gim, '</p><p>');
    output = `<p>${output}</p>`;

    return output;
  }

  escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

// Export for app use
window.MarkdownRenderer = MarkdownRenderer;
