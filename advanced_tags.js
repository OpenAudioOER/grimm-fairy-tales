import fs from 'fs';
import path from 'path';

const stories = JSON.parse(fs.readFileSync('./src/stories.json', 'utf8'));
const storiesDir = './public/stories';

const themes = {
  'Royalty': ['king', 'queen', 'princess', 'prince', 'castle', 'palace', 'kingdom', 'royal'],
  'Magic': ['magic', 'witch', 'fairy', 'spell', 'enchanted', 'curse', 'wand', 'wizard', 'wishing'],
  'Animals': ['wolf', 'bear', 'fox', 'frog', 'cat', 'mouse', 'bird', 'lion', 'horse', 'hare', 'fish', 'raven', 'goose'],
  'Dark/Macabre': ['blood', 'kill', 'death', 'devil', 'murder', 'thief', 'grave', 'corpse', 'sword', 'axe'],
  'Nature/Forest': ['wood', 'forest', 'tree', 'hunter', 'huntsman', 'mountain', 'river'],
  'Romance': ['marry', 'bride', 'wedding', 'husband', 'wife', 'love', 'kiss'],
  'Wealth': ['gold', 'silver', 'treasure', 'rich', 'coin', 'money', 'jewel', 'diamonds'],
  'Poverty': ['poor', 'beggar', 'hunger', 'starve', 'rags', 'starving'],
  'Supernatural': ['dwarf', 'giant', 'elves', 'spirit', 'ghost', 'dragon', 'monster', 'nix', 'goblin'],
  'Trickery': ['clever', 'trick', 'fool', 'cunning', 'wise', 'riddle', 'deceive']
};

stories.forEach(story => {
  const filePath = path.join(storiesDir, `${story.id}.txt`);
  if (!fs.existsSync(filePath)) return;
  
  const text = fs.readFileSync(filePath, 'utf8').toLowerCase();
  const title = story.title.toLowerCase();
  
  const scores = {};
  for (const [theme, words] of Object.entries(themes)) {
    scores[theme] = 0;
    for (const word of words) {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = text.match(regex);
      if (matches) scores[theme] += matches.length;
      
      if (title.includes(word)) scores[theme] += 10;
    }
  }
  
  const sortedThemes = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .filter(t => t[1] >= 2) 
    .map(t => t[0]);
    
  let finalTags = sortedThemes.slice(0, 3);
  if (finalTags.length === 0) finalTags = ['Classic Tale'];
  
  story.tags = finalTags;
});

fs.writeFileSync('./src/stories.json', JSON.stringify(stories, null, 2));
