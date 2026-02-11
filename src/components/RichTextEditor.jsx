import React, { useRef, useState } from 'react';
import { Bold, Italic, List, Link2, Type } from 'lucide-react';

const RichTextEditor = ({ value, onChange, placeholder, className = '' }) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    if (onChange) {
      onChange(editorRef.current?.innerHTML || '');
    }
  };

  const handleInput = () => {
    if (onChange) {
      onChange(editorRef.current?.innerHTML || '');
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  React.useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  return (
    <div className={`rich-text-editor border border-gray-300 rounded-lg overflow-hidden bg-white ${className}`}>
      <div className="toolbar flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-200">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="غامق"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="مائل"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="قائمة"
        >
          <List className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-300" />
        <select
          onChange={(e) => execCommand('formatBlock', e.target.value)}
          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 transition-colors"
          defaultValue=""
        >
          <option value="">عادي</option>
          <option value="h1">عنوان 1</option>
          <option value="h2">عنوان 2</option>
          <option value="h3">عنوان 3</option>
        </select>
        <button
          type="button"
          onClick={() => {
            const url = prompt('أدخل الرابط:');
            if (url) execCommand('createLink', url);
          }}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="رابط"
        >
          <Link2 className="w-4 h-4" />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`p-4 min-h-[200px] outline-none prose max-w-none ${
          !value && !isFocused ? 'text-gray-400' : ''
        }`}
        data-placeholder={placeholder}
        style={{
          direction: 'rtl'
        }}
      />
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        [contenteditable] h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        [contenteditable] ul {
          list-style: disc;
          margin: 1em 0;
          padding-right: 2em;
        }
        [contenteditable] a {
          color: #276073;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
