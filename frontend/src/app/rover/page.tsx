'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResponseDisplay } from '@/components/rover/ResponseDisplay';
import { QueryInput } from '@/components/rover/QueryInput';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';

interface Message {
  type: 'thought' | 'action' | 'dom_update' | 'interaction' | 'browser_action' | 
        'rag_action' | 'review' | 'close_tab' | 'subtopics' | 'subtopic_answer' |
        'subtopic_status' | 'compile' | 'final_answer' | 'conversation_history' |
        'cleanup' | 'error' | 'final_response' | 'user_input';
  content: string;
}

type AgentType = 'task' | 'research' | 'deep_research';

export default function RoverPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResearchMode, setIsResearchMode] = useState(true);
  const [isDeepResearch, setIsDeepResearch] = useState(true);

  const currentAgent: AgentType = isResearchMode 
    ? (isDeepResearch ? 'deep_research' : 'research')
    : 'task';

  const handleDisconnect = async () => {
    try {
      const response = await fetch('http://localhost:8000/cleanup', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to cleanup browser');
      }
      
      await router.push('/');
    } catch (error) {
      console.error('Failed to cleanup browser:', error);
      // Still try to navigate even if cleanup fails
      await router.push('/');
    }
  };

  const handleStreamingResponse = async (response: Response) => {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response reader');

    const decoder = new TextDecoder();
    let buffer = '';

    const processSSEMessage = (message: string) => {
      try {
        const jsonStr = message.replace(/^data: /, '').trim();
        const data = JSON.parse(jsonStr);
        
        if (data.type === 'keepalive') return;
        
        const cleanContent = (content: unknown): string => {
          // If content is already an array, return it directly joined by newline
          if (Array.isArray(content)) {
            return content.join('\n');
          }
          
          if (typeof content === 'string') {
            try {
              // Try to parse as JSON
              const parsed = JSON.parse(content);
              if (Array.isArray(parsed)) {
                return parsed.join('\n');
              }
              // If it's a string with ["..."] pattern
              if (content.startsWith('["') && content.endsWith('"]')) {
                return content.slice(2, -2);
              }
            } catch {
              // If parsing fails and it has the pattern
              if (content.startsWith('["') && content.endsWith('"]')) {
                return content.slice(2, -2);
              }
            }
            return content;
          }
          return String(content || '');
        };

        const processedData: Message = {
          type: data.type as Message['type'],
          content: cleanContent(data.content)
        };
        
        // Handle different message types based on agent
        switch (data.type) {
          case 'thought':
          case 'action':
          case 'browser_action':
          case 'final_answer':
          case 'final_response':
          case 'dom_update':
          case 'interaction':
            setMessages(prev => [...prev, processedData]);
            break;
          
          // Research specific events
          case 'rag_action':
          case 'review':
          case 'close_tab':
          case 'cleanup':
            if (isResearchMode) {
              setMessages(prev => [...prev, processedData]);
            }
            break;
          
          // Deep research specific events
          case 'subtopics':
          case 'subtopic_answer':
          case 'subtopic_status':
          case 'compile':
            if (isResearchMode && isDeepResearch) {
              setMessages(prev => [...prev, processedData]);
            }
            break;
          
          case 'error':
            setMessages(prev => [...prev, processedData]);
            break;
        }
      } catch (e) {
        console.error('Failed to parse SSE message:', message, e);
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      // Find complete SSE messages
      const messages = buffer.match(/data: {[\s\S]*?}\n\n/g);
      
      if (messages) {
        messages.forEach(processSSEMessage);
        // Remove processed messages from buffer
        buffer = buffer.slice(buffer.lastIndexOf('}') + 1);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    // Add user message to the chat history
    setMessages(prev => [...prev, { type: 'user_input', content: query }]);
    const currentQuery = query;
    setQuery(''); // Clear input after sending

    try {
      const response = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: currentQuery,
          agent_type: currentAgent 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send query');
      }

      await handleStreamingResponse(response);
    } catch (error) {
      console.error('Query failed:', error);
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: error instanceof Error ? error.message : 'Failed to process query. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-zinc-950">
      
      {/* Header with Toggles */}
      <header className="fixed top-0 left-0 right-0 p-4 backdrop-blur-md bg-zinc-950/80 z-50
                      border-b border-zinc-900 shadow-sm">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <h1 className="text-2xl font-semibold text-[#fafae8] tracking-tight">
            Sp//der
          </h1>
          
          <div className="flex-1 flex justify-center items-center">
            <div className="flex items-center space-x-24">
              <div className="flex flex-col items-center min-w-[280px]">
                <div className="flex items-center space-x-6">
                  <span className="text-zinc-400 text-sm">Task</span>
                  <ToggleSwitch
                    enabled={isResearchMode}
                    onChange={setIsResearchMode}
                    label=""
                  />
                  <span className="text-zinc-400 text-sm">Research</span>
                </div>
                <span className="text-xs text-zinc-500 mt-2">Switch between Task and Research agents</span>
              </div>
              
              <div className={`flex flex-col items-center min-w-[280px] transition-opacity duration-300 ${isResearchMode ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center space-x-6">
                  <span className="text-zinc-400 text-sm">Normal</span>
                  <ToggleSwitch
                    enabled={isDeepResearch}
                    onChange={setIsDeepResearch}
                    label=""
                  />
                  <span className="text-zinc-400 text-sm">Deep Research</span>
                </div>
                <span className="text-xs text-zinc-500 mt-2">Enable comprehensive research mode</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDisconnect}
            className="px-4 py-2 rounded-full whitespace-nowrap text-sm
                     bg-zinc-900 border border-zinc-800 text-zinc-400
                     hover:bg-zinc-850 hover:text-[#fafae8] hover:border-zinc-700
                     transition-all duration-200"
          >
            Disconnect Browser
          </button>
        </div>
      </header>

      {/* Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <QueryInput
          value={query}
          onChange={setQuery}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content */}
      <main className="relative pt-24 pb-32 z-10 overflow-y-auto h-[calc(100vh-140px)]">
        <div className="w-full pb-16">
          <ResponseDisplay messages={messages} />
        </div>
      </main>
    </div>
  );
}