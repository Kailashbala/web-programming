/**
 * Markdown Previewer - Editor Ergonomics Engine
 * Handles keyboard behavior, tab indentations, auto-pairing,
 * smart list continuation, toolbar actions, and cursor tracking.
 */

class EditorController {
  constructor(textarea, onChangeCallback) {
    this.textarea = textarea;
    this.onChange = onChangeCallback || (() => {});
    this.history = [];
    this.historyIndex = -1;

    this.bindEvents();
  }

  bindEvents() {
    this.textarea.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.textarea.addEventListener('input', () => this.handleInput());
    this.textarea.addEventListener('click', () => this.updateCursorStats());
    this.textarea.addEventListener('keyup', () => this.updateCursorStats());
  }

  handleInput() {
    this.onChange(this.textarea.value);
  }

  /**
   * Enhanced keyboard actions
   */
  handleKeyDown(e) {
    const { key, shiftKey, ctrlKey, metaKey, altKey } = e;
    const isCmdOrCtrl = ctrlKey || metaKey;

    // 1. Tab & Shift+Tab indentation
    if (key === 'Tab') {
      e.preventDefault();
      this.handleTab(shiftKey);
      return;
    }

    // 2. Keyboard shortcuts
    if (isCmdOrCtrl) {
      if (key.toLowerCase() === 'b') {
        e.preventDefault();
        this.applyFormat('bold');
        return;
      }
      if (key.toLowerCase() === 'i') {
        e.preventDefault();
        this.applyFormat('italic');
        return;
      }
      if (key.toLowerCase() === 'k') {
        e.preventDefault();
        this.applyFormat('link');
        return;
      }
      if (shiftKey && key.toLowerCase() === 'x') {
        e.preventDefault();
        this.applyFormat('strikethrough');
        return;
      }
    }

    // 3. Smart Enter (List continuation)
    if (key === 'Enter') {
      if (this.handleSmartEnter(e)) {
        return;
      }
    }

    // 4. Auto-closing pairs and wrapping
    if (['(', '[', '{', '`', '"', "'", '*'].includes(key) && !isCmdOrCtrl) {
      if (this.handleAutoPairing(key, e)) {
        return;
      }
    }

    // 5. Backspace on empty auto-pair
    if (key === 'Backspace') {
      if (this.handleBackspacePair(e)) {
        return;
      }
    }
  }

  /**
   * Smart Tab / Shift+Tab logic
   */
  handleTab(isShift) {
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const text = this.textarea.value;
    const tabSpaces = '  '; // 2 spaces standard

    if (start === end) {
      if (!isShift) {
        // Simple insert
        this.insertTextAtCursor(tabSpaces);
      }
      return;
    }

    // Multi-line selection indent/unindent
    const firstLineStart = text.lastIndexOf('\n', start - 1) + 1;
    let lastLineEnd = text.indexOf('\n', end);
    if (lastLineEnd === -1) lastLineEnd = text.length;

    const selectedLines = text.substring(firstLineStart, lastLineEnd).split('\n');

    let modifiedLines;
    let lengthDelta = 0;

    if (!isShift) {
      modifiedLines = selectedLines.map(line => {
        lengthDelta += tabSpaces.length;
        return tabSpaces + line;
      });
    } else {
      modifiedLines = selectedLines.map(line => {
        if (line.startsWith('  ')) {
          lengthDelta -= 2;
          return line.substring(2);
        } else if (line.startsWith('\t') || line.startsWith(' ')) {
          lengthDelta -= 1;
          return line.substring(1);
        }
        return line;
      });
    }

    const replacement = modifiedLines.join('\n');
    this.textarea.value = text.substring(0, firstLineStart) + replacement + text.substring(lastLineEnd);
    this.textarea.setSelectionRange(start + (isShift ? -2 : 2), end + lengthDelta);
    this.handleInput();
  }

  /**
   * Smart Enter: automatically continues lists or clears empty list items
   */
  handleSmartEnter(e) {
    const start = this.textarea.selectionStart;
    const text = this.textarea.value;

    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const currentLine = text.substring(lineStart, start);

    // 1. Task List: - [ ] or - [x]
    const taskMatch = currentLine.match(/^(\s*)-\s\[([ xX])\]\s*(.*)$/);
    if (taskMatch) {
      e.preventDefault();
      const indent = taskMatch[1];
      const itemContent = taskMatch[3];

      // If user pressed enter on an empty task list item, remove the bullet
      if (!itemContent || itemContent.trim() === '') {
        this.textarea.value = text.substring(0, lineStart) + text.substring(start);
        this.textarea.setSelectionRange(lineStart, lineStart);
      } else {
        const continuation = `\n${indent}- [ ] `;
        this.insertTextAtCursor(continuation);
      }
      this.handleInput();
      return true;
    }

    // 2. Unordered List: - or *
    const bulletMatch = currentLine.match(/^(\s*)([-*])\s+(.*)$/);
    if (bulletMatch) {
      e.preventDefault();
      const indent = bulletMatch[1];
      const marker = bulletMatch[2];
      const itemContent = bulletMatch[3];

      if (!itemContent || itemContent.trim() === '') {
        this.textarea.value = text.substring(0, lineStart) + text.substring(start);
        this.textarea.setSelectionRange(lineStart, lineStart);
      } else {
        const continuation = `\n${indent}${marker} `;
        this.insertTextAtCursor(continuation);
      }
      this.handleInput();
      return true;
    }

    // 3. Ordered List: 1. , 2. , etc.
    const numMatch = currentLine.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (numMatch) {
      e.preventDefault();
      const indent = numMatch[1];
      const num = parseInt(numMatch[2], 10);
      const itemContent = numMatch[3];

      if (!itemContent || itemContent.trim() === '') {
        this.textarea.value = text.substring(0, lineStart) + text.substring(start);
        this.textarea.setSelectionRange(lineStart, lineStart);
      } else {
        const continuation = `\n${indent}${num + 1}. `;
        this.insertTextAtCursor(continuation);
      }
      this.handleInput();
      return true;
    }

    // 4. Blockquote continuation: >
    const quoteMatch = currentLine.match(/^(\s*>\s*)(.*)$/);
    if (quoteMatch) {
      const quotePrefix = quoteMatch[1];
      const quoteContent = quoteMatch[2];

      if (!quoteContent || quoteContent.trim() === '') {
        e.preventDefault();
        this.textarea.value = text.substring(0, lineStart) + text.substring(start);
        this.textarea.setSelectionRange(lineStart, lineStart);
        this.handleInput();
        return true;
      } else {
        e.preventDefault();
        this.insertTextAtCursor(`\n${quotePrefix}`);
        this.handleInput();
        return true;
      }
    }

    return false;
  }

  /**
   * Auto-pair brackets, quotes, and markdown tokens
   */
  handleAutoPairing(char, e) {
    const pairs = {
      '(': ')',
      '[': ']',
      '{': '}',
      '`': '`',
      '"': '"',
      "'": "'",
      '*': '*'
    };

    const closingChar = pairs[char];
    if (!closingChar) return false;

    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const text = this.textarea.value;

    // If text is selected: wrap selection
    if (start !== end) {
      e.preventDefault();
      const selected = text.substring(start, end);
      const wrapped = `${char}${selected}${closingChar}`;
      this.textarea.value = text.substring(0, start) + wrapped + text.substring(end);
      this.textarea.setSelectionRange(start + 1, end + 1);
      this.handleInput();
      return true;
    }

    // If no text selected: auto close brackets and backticks
    if (['(', '[', '{', '`'].includes(char)) {
      e.preventDefault();
      this.textarea.value = text.substring(0, start) + char + closingChar + text.substring(end);
      this.textarea.setSelectionRange(start + 1, start + 1);
      this.handleInput();
      return true;
    }

    return false;
  }

  /**
   * Remove both opening and closing character when backspacing between them
   */
  handleBackspacePair(e) {
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const text = this.textarea.value;

    if (start === end && start > 0) {
      const charBefore = text.charAt(start - 1);
      const charAfter = text.charAt(start);

      const pairs = { '(': ')', '[': ']', '{': '}', '`': '`', '"': '"', "'": "'" };
      if (pairs[charBefore] === charAfter) {
        e.preventDefault();
        this.textarea.value = text.substring(0, start - 1) + text.substring(start + 1);
        this.textarea.setSelectionRange(start - 1, start - 1);
        this.handleInput();
        return true;
      }
    }
    return false;
  }

  /**
   * Helper: Inserts text at cursor with undo support
   */
  insertTextAtCursor(text) {
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const value = this.textarea.value;

    this.textarea.value = value.substring(0, start) + text + value.substring(end);
    const newPos = start + text.length;
    this.textarea.setSelectionRange(newPos, newPos);
    this.handleInput();
  }

  /**
   * Apply markdown formatting from toolbar buttons or shortcuts
   */
  applyFormat(formatType) {
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const text = this.textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = '';
    let selectionOffsetStart = 0;
    let selectionOffsetEnd = 0;

    switch (formatType) {
      case 'h1':
        this.applyHeading('# ');
        return;
      case 'h2':
        this.applyHeading('## ');
        return;
      case 'h3':
        this.applyHeading('### ');
        return;
      case 'bold':
        if (selectedText) {
          replacement = `**${selectedText}**`;
          selectionOffsetStart = 2;
          selectionOffsetEnd = 2 + selectedText.length;
        } else {
          replacement = '**bold text**';
          selectionOffsetStart = 2;
          selectionOffsetEnd = 11;
        }
        break;
      case 'italic':
        if (selectedText) {
          replacement = `*${selectedText}*`;
          selectionOffsetStart = 1;
          selectionOffsetEnd = 1 + selectedText.length;
        } else {
          replacement = '*italic text*';
          selectionOffsetStart = 1;
          selectionOffsetEnd = 12;
        }
        break;
      case 'strikethrough':
        if (selectedText) {
          replacement = `~~${selectedText}~~`;
          selectionOffsetStart = 2;
          selectionOffsetEnd = 2 + selectedText.length;
        } else {
          replacement = '~~strikethrough~~';
          selectionOffsetStart = 2;
          selectionOffsetEnd = 15;
        }
        break;
      case 'code-inline':
        if (selectedText) {
          replacement = `\`${selectedText}\``;
          selectionOffsetStart = 1;
          selectionOffsetEnd = 1 + selectedText.length;
        } else {
          replacement = '`code`';
          selectionOffsetStart = 1;
          selectionOffsetEnd = 5;
        }
        break;
      case 'code-block':
        if (selectedText) {
          replacement = `\`\`\`javascript\n${selectedText}\n\`\`\``;
          selectionOffsetStart = 14;
          selectionOffsetEnd = 14 + selectedText.length;
        } else {
          replacement = '```javascript\n// Write code here\nconsole.log("Hello, world!");\n```';
          selectionOffsetStart = 14;
          selectionOffsetEnd = 32;
        }
        break;
      case 'blockquote':
        this.applyLinePrefix('> ');
        return;
      case 'bullet-list':
        this.applyLinePrefix('- ');
        return;
      case 'numbered-list':
        this.applyNumberedList();
        return;
      case 'task-list':
        this.applyLinePrefix('- [ ] ');
        return;
      case 'link':
        if (selectedText) {
          replacement = `[${selectedText}](https://example.com)`;
          selectionOffsetStart = selectedText.length + 3;
          selectionOffsetEnd = replacement.length - 1;
        } else {
          replacement = '[Link Title](https://example.com)';
          selectionOffsetStart = 1;
          selectionOffsetEnd = 11;
        }
        break;
      case 'image':
        if (selectedText) {
          replacement = `![${selectedText}](https://images.unsplash.com/photo-1518770660439-4636190af475?w=800)`;
          selectionOffsetStart = selectedText.length + 4;
          selectionOffsetEnd = replacement.length - 1;
        } else {
          replacement = '![Image description](https://images.unsplash.com/photo-1518770660439-4636190af475?w=800)';
          selectionOffsetStart = 2;
          selectionOffsetEnd = 19;
        }
        break;
      case 'table':
        replacement = '\n| Header 1 | Header 2 | Header 3 |\n| :--- | :---: | ---: |\n| Data A1 | Data B1 | $100 |\n| Data A2 | Data B2 | $250 |\n';
        selectionOffsetStart = 3;
        selectionOffsetEnd = 11;
        break;
      case 'hr':
        replacement = '\n---\n';
        selectionOffsetStart = 5;
        selectionOffsetEnd = 5;
        break;
      case 'callout':
        replacement = '\n> [!NOTE]\n> Add important contextual details here for the reader.\n';
        selectionOffsetStart = 13;
        selectionOffsetEnd = 59;
        break;
      default:
        return;
    }

    this.textarea.value = text.substring(0, start) + replacement + text.substring(end);
    this.textarea.focus();
    this.textarea.setSelectionRange(start + selectionOffsetStart, start + selectionOffsetEnd);
    this.handleInput();
  }

  /**
   * Apply heading prefix (#, ##, ###) to current line
   */
  applyHeading(prefix) {
    const start = this.textarea.selectionStart;
    const text = this.textarea.value;
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = text.indexOf('\n', start);
    const endPos = lineEnd === -1 ? text.length : lineEnd;
    const line = text.substring(lineStart, endPos);

    // Strip any existing heading hashes
    const cleanLine = line.replace(/^#{1,6}\s*/, '');
    const newLine = `${prefix}${cleanLine}`;

    this.textarea.value = text.substring(0, lineStart) + newLine + text.substring(endPos);
    this.textarea.focus();
    const newCursor = lineStart + newLine.length;
    this.textarea.setSelectionRange(newCursor, newCursor);
    this.handleInput();
  }

  /**
   * Prefix each selected line with a bullet/quote
   */
  applyLinePrefix(prefix) {
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const text = this.textarea.value;

    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    let lineEnd = text.indexOf('\n', end);
    if (lineEnd === -1) lineEnd = text.length;

    const lines = text.substring(lineStart, lineEnd).split('\n');
    const modified = lines.map(line => `${prefix}${line}`).join('\n');

    this.textarea.value = text.substring(0, lineStart) + modified + text.substring(lineEnd);
    this.textarea.focus();
    this.textarea.setSelectionRange(lineStart, lineStart + modified.length);
    this.handleInput();
  }

  /**
   * Prefix each selected line with sequential numbers
   */
  applyNumberedList() {
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const text = this.textarea.value;

    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    let lineEnd = text.indexOf('\n', end);
    if (lineEnd === -1) lineEnd = text.length;

    const lines = text.substring(lineStart, lineEnd).split('\n');
    const modified = lines.map((line, idx) => `${idx + 1}. ${line}`).join('\n');

    this.textarea.value = text.substring(0, lineStart) + modified + text.substring(lineEnd);
    this.textarea.focus();
    this.textarea.setSelectionRange(lineStart, lineStart + modified.length);
    this.handleInput();
  }

  /**
   * Updates line & column cursor statistics
   */
  updateCursorStats() {
    const pos = this.textarea.selectionStart;
    const text = this.textarea.value.substring(0, pos);
    const lines = text.split('\n');
    const lineNum = lines.length;
    const colNum = lines[lines.length - 1].length + 1;

    const cursorIndicator = document.getElementById('cursor-pos');
    if (cursorIndicator) {
      cursorIndicator.textContent = `Ln ${lineNum}, Col ${colNum}`;
    }
  }

  /**
   * Toggle task checkbox in textarea when clicked from the preview pane!
   */
  toggleTaskCheckboxAt(checkboxIndex, isChecked) {
    const text = this.textarea.value;
    const taskRegex = /^(\s*-\s\[)([ xX])(\]\s.*)$/gm;

    let match;
    let currentIndex = 0;

    while ((match = taskRegex.exec(text)) !== null) {
      if (currentIndex === checkboxIndex) {
        const matchStart = match.index;
        const prefix = match[1];
        const newMark = isChecked ? 'x' : ' ';
        const suffix = match[3];
        const replacement = `${prefix}${newMark}${suffix}`;

        this.textarea.value = text.substring(0, matchStart) + replacement + text.substring(matchStart + match[0].length);
        this.handleInput();
        return;
      }
      currentIndex++;
    }
  }
}

window.EditorController = EditorController;
