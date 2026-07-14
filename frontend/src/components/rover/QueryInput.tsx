import { useRef } from 'react';

interface QueryInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function QueryInput({ value, onChange, onSubmit, isLoading }: QueryInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  const adjustHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    adjustHeight();
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="w-full p-6 pb-8 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent">
      <div className="max-w-[800px] mx-auto">
         <div className="relative flex items-start">
          <textarea
            ref={inputRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            placeholder="Ask Sp//der anything..."
            rows={1}
            className="w-full px-6 py-4 pr-24 bg-zinc-900/40 backdrop-blur-sm 
                     border border-zinc-850 rounded-2xl
                     text-[#fafae8] placeholder-zinc-505
                     focus:outline-none focus:ring-1 focus:ring-zinc-700
                     focus:border-zinc-700
                     hover:border-zinc-850 transition-all duration-200
                     resize-none overflow-hidden min-h-[60px] max-h-[120px]"
          />
          
          <button
            onClick={onSubmit}
            disabled={isLoading || !value.trim()}
            className="absolute right-2 top-2 px-6 py-2.5 
                     bg-[#fafae8] hover:bg-[#fafae8]/90
                     rounded-xl text-zinc-950 font-medium
                     disabled:bg-zinc-900 disabled:text-zinc-650 disabled:opacity-50
                     transform active:scale-[0.98]
                     transition-all duration-200"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950/90 
                           rounded-full animate-spin" />
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 