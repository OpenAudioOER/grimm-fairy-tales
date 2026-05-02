import React, { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, CheckCircle, ChevronLeft, EyeOff, X, Tag } from 'lucide-react';
import storyIndex from './stories.json';

type Story = {
  id: string;
  title: string;
  readingTime: number;
  tags?: string[];
};

function App() {
  const [readStories, setReadStories] = useState<string[]>(() => {
    const saved = localStorage.getItem('grimm-read');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [storyContent, setStoryContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    (storyIndex as Story[]).forEach(story => {
      story.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, []);

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
    return (storyIndex as Story[]).filter(story => {
      const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesUnread = showUnreadOnly ? !readStories.includes(story.id) : true;
      const matchesTag = selectedTag ? story.tags?.includes(selectedTag) : true;
      return matchesSearch && matchesUnread && matchesTag;
    });
  }, [searchQuery, showUnreadOnly, readStories, selectedTag]);

  if (selectedStory) {
    const isRead = readStories.includes(selectedStory.id);
    return (
      <div className="min-h-screen pb-20 bg-[#F6F4ED]">
        <header className="sticky top-0 bg-[#F6F4ED]/80 backdrop-blur-xl border-b border-[#E5DFD1] z-10 px-4 py-3 flex items-center justify-between shadow-sm">
          <button 
            onClick={() => setSelectedStory(null)}
            className="flex items-center gap-2 text-[#4A453F] hover:text-[#1C1C1C] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium text-sm">Library</span>
          </button>
          
          <button
            onClick={() => toggleRead(selectedStory.id)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border ${
              isRead ? 'bg-[#E5F2EA] text-[#2F6B4A] border-[#D1E6D8]' : 'bg-white/60 text-[#4A453F] hover:bg-white border-[#E5DFD1]'
            }`}
          >
            <CheckCircle className={`w-4 h-4 ${isRead ? 'fill-[#A9D8B9]' : ''}`} />
            {isRead ? 'Read' : 'Mark as Read'}
          </button>
        </header>
        
        <main className="max-w-2xl mx-auto px-6 pt-12 pb-24">
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-[#2C2825] mb-12 text-center leading-tight">
            {selectedStory.title}
          </h1>
          
          {isLoading ? (
            <div className="flex justify-center py-20 text-[#8C867B]">Loading tale...</div>
          ) : (
            <div className="font-serif text-lg leading-relaxed text-[#2C2825]/90 whitespace-pre-wrap">
              {storyContent}
            </div>
          )}
          
          {!isLoading && (
            <div className="mt-20 pt-8 border-t border-[#E5DFD1] flex justify-center">
               <button
                onClick={() => {
                  if (!isRead) toggleRead(selectedStory.id);
                  setSelectedStory(null);
                }}
                className="bg-[#2C2825] text-[#F6F4ED] px-8 py-3 rounded-full font-medium hover:bg-[#1C1C1C] transition-colors shadow-md"
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
    <div className="min-h-screen pb-12">
      <header className="sticky top-0 z-20 bg-[#F6F4ED]/70 backdrop-blur-xl border-b border-[#E5DFD1] shadow-[0_4px_30px_rgba(0,0,0,0.03)] px-4 py-4 md:py-5 transition-all duration-300">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            {!(isSearchOpen || isTagFilterOpen) && (
              <div className="flex-1">
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#2C2825]">Grimms' Fairy Tales</h1>
                <p className="text-[#8C867B] mt-0.5 text-xs font-medium">{readStories.length} of {storyIndex.length} read</p>
              </div>
            )}
            
            {isSearchOpen && (
              <div className="flex-1 flex items-center relative animate-in fade-in slide-in-from-right-4 duration-300 mr-2">
                <Search className="absolute left-3 w-4 h-4 text-[#8C867B]" />
                <input 
                  type="text"
                  autoFocus
                  placeholder="Search 209 tales..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white/60 text-[#2C2825] placeholder-[#8C867B] border border-[#E5DFD1] rounded-full py-2 pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-[#C3BAAA] transition-all shadow-inner"
                />
                <button 
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="absolute right-2 p-1 rounded-full hover:bg-black/5 text-[#8C867B] hover:text-[#2C2825] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {isTagFilterOpen && (
              <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-1 animate-in fade-in slide-in-from-right-4 duration-300 mr-2">
                <button
                   onClick={() => setSelectedTag(null)}
                   className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                     selectedTag === null ? 'bg-[#2C2825] text-white border-[#2C2825]' : 'bg-white/60 text-[#4A453F] border-[#E5DFD1] hover:bg-white'
                   }`}
                >
                  All
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selectedTag === tag ? 'bg-[#2C2825] text-white border-[#2C2825]' : 'bg-white/60 text-[#4A453F] border-[#E5DFD1] hover:bg-white'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                <button 
                  onClick={() => setIsTagFilterOpen(false)}
                  className="sticky right-0 ml-auto p-1.5 bg-[#F6F4ED]/90 backdrop-blur-sm rounded-full hover:bg-black/5 text-[#8C867B] transition-colors border border-[#E5DFD1]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {!(isSearchOpen || isTagFilterOpen) && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsTagFilterOpen(true)}
                  className={`p-2 rounded-full transition-colors shadow-sm border ${
                    selectedTag ? 'bg-[#2C2825] text-white border-[#2C2825]' : 'bg-white/60 hover:bg-white text-[#4A453F] border-[#E5DFD1]'
                  }`}
                >
                  <Tag className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 rounded-full bg-white/60 hover:bg-white text-[#4A453F] border border-[#E5DFD1] transition-colors shadow-sm"
                >
                  <Search className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button 
                  onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs md:text-sm font-medium transition-all shadow-sm border ${
                    showUnreadOnly 
                      ? 'bg-[#2C2825] text-white border-[#2C2825]' 
                      : 'bg-white/60 text-[#4A453F] border-[#E5DFD1] hover:bg-white'
                  }`}
                >
                  {showUnreadOnly ? <BookOpen className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span className="hidden sm:inline">{showUnreadOnly ? 'Showing Unread' : 'Hide Read'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-6 md:mt-8">
        {filteredStories.length === 0 ? (
          <div className="text-center py-20 text-[#8C867B] font-serif italic text-lg">
            No tales found matching your criteria.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredStories.map((story) => {
              const isRead = readStories.includes(story.id);
              return (
                <div 
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className={`group flex items-center justify-between p-4 md:p-5 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md border shadow-sm ${
                    isRead 
                      ? 'bg-white/40 border-[#E5DFD1]/50 opacity-60 hover:opacity-100 hover:bg-white/60' 
                      : 'bg-white/80 border-[#E5DFD1] hover:-translate-y-0.5 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-bold text-[#8C867B] uppercase tracking-wider bg-black/5 px-2 py-0.5 rounded-full">
                        No. {story.id}
                      </span>
                      <span className="text-[10px] font-semibold text-[#8C867B] flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {story.readingTime} min
                      </span>
                    </div>
                    
                    <h2 className={`font-serif text-xl leading-tight mb-2 ${isRead ? 'text-[#4A453F]' : 'text-[#2C2825] font-semibold'}`}>
                      {story.title}
                    </h2>

                    {story.tags && story.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {story.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-bold uppercase tracking-wider text-[#8C867B] bg-[#F6F4ED] px-2 py-1 rounded border border-[#E5DFD1]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={(e) => toggleRead(story.id, e)}
                    className={`p-2 rounded-full transition-colors shrink-0 border ${
                      isRead ? 'bg-[#E5F2EA] text-[#2F6B4A] border-[#D1E6D8]' : 'bg-[#F6F4ED] text-[#C3BAAA] border-[#E5DFD1] hover:text-[#2C2825] hover:bg-white'
                    }`}
                  >
                    <CheckCircle className={`w-6 h-6 ${isRead ? 'fill-[#A9D8B9]' : ''}`} />
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
