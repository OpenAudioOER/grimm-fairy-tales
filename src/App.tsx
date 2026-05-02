import React, { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, CheckCircle, ChevronLeft, EyeOff } from 'lucide-react';
import storyIndex from './stories.json';

function App() {
  const [readStories, setReadStories] = useState<string[]>(() => {
    const saved = localStorage.getItem('grimm-read');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStory, setSelectedStory] = useState<{id: string, title: string} | null>(null);
  const [storyContent, setStoryContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('grimm-read', JSON.stringify(readStories));
  }, [readStories]);

  useEffect(() => {
    if (selectedStory) {
      setIsLoading(true);
      fetch(`/stories/${selectedStory.id}.txt`)
        .then(res => res.text())
        .then(text => {
          setStoryContent(text);
          setIsLoading(false);
          window.scrollTo(0, 0);
        })
        .catch(err => {
          console.error("Failed to load story", err);
          setStoryContent("Sorry, we couldn't load this story.");
          setIsLoading(false);
        });
    }
  }, [selectedStory]);

  const toggleRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReadStories(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const filteredStories = useMemo(() => {
    return storyIndex.filter(story => {
      const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesUnread = showUnreadOnly ? !readStories.includes(story.id) : true;
      return matchesSearch && matchesUnread;
    });
  }, [searchQuery, showUnreadOnly, readStories]);

  if (selectedStory) {
    const isRead = readStories.includes(selectedStory.id);
    return (
      <div className="min-h-screen bg-paper pb-20">
        <header className="sticky top-0 bg-paper/90 backdrop-blur-md border-b border-slate-200 z-10 px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => setSelectedStory(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium text-sm">Library</span>
          </button>
          
          <button
            onClick={() => toggleRead(selectedStory.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              isRead ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckCircle className={`w-4 h-4 ${isRead ? 'fill-emerald-200' : ''}`} />
            {isRead ? 'Read' : 'Mark as Read'}
          </button>
        </header>
        
        <main className="max-w-2xl mx-auto px-6 pt-12 pb-24">
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-ink mb-12 text-center leading-tight">
            {selectedStory.title}
          </h1>
          
          {isLoading ? (
            <div className="flex justify-center py-20 text-slate-400">Loading tale...</div>
          ) : (
            <div className="font-serif text-lg leading-relaxed text-ink/90 whitespace-pre-wrap">
              {storyContent}
            </div>
          )}
          
          {!isLoading && (
            <div className="mt-20 pt-8 border-t border-slate-200 flex justify-center">
               <button
                onClick={() => {
                  if (!isRead) toggleRead(selectedStory.id);
                  setSelectedStory(null);
                }}
                className="bg-ink text-paper px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                Return to Library
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper pb-12">
      <header className="bg-ink text-paper px-4 pt-12 pb-6 md:pt-16 md:pb-8 sticky top-0 z-20 shadow-md">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold">Grimm's Household Tales</h1>
              <p className="text-slate-400 mt-1 text-sm">{readStories.length} of {storyIndex.length} read</p>
            </div>
            
            <div className="flex items-center gap-3">
               <button 
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showUnreadOnly ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {showUnreadOnly ? <BookOpen className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {showUnreadOnly ? 'Showing Unread' : 'Hide Read'}
              </button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search 209 tales..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/50 text-white placeholder-slate-400 border border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6">
        {filteredStories.length === 0 ? (
          <div className="text-center py-20 text-slate-500 font-serif italic">
            No tales found matching your search.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredStories.map(story => {
              const isRead = readStories.includes(story.id);
              return (
                <div 
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className={`group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                    isRead 
                      ? 'opacity-60 hover:opacity-100 bg-transparent' 
                      : 'bg-white shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">No. {story.id}</span>
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {story.readingTime} min read
                      </span>
                    </div>
                    <h2 className={`font-serif text-lg leading-tight ${isRead ? 'text-slate-600' : 'text-slate-900 font-semibold'}`}>
                      {story.title}
                    </h2>
                  </div>
                  
                  <button 
                    onClick={(e) => toggleRead(story.id, e)}
                    className={`p-2 rounded-full transition-colors shrink-0 ${
                      isRead ? 'bg-emerald-50 text-emerald-600' : 'text-slate-300 hover:text-emerald-500 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle className={`w-6 h-6 ${isRead ? 'fill-emerald-200' : ''}`} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
