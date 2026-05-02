import fs from 'fs';

const stories = JSON.parse(fs.readFileSync('./src/stories.json', 'utf8'));

const keywords = {
  'Royalty': ['princess', 'queen', 'bride', 'maid', 'king', 'prince', 'castle'],
  'Magic': ['magic', 'wishing', 'crystal', 'water of life', 'spell', 'witch', 'fairy'],
  'Animals': ['frog', 'wolf', 'cat', 'mouse', 'bird', 'dog', 'fox', 'bear', 'hare', 'fish', 'raven', 'goose', 'lion', 'bee'],
  'Dark': ['devil', 'death', 'robber', 'blood', 'grave', 'shroud', 'bone', 'thief', 'murder'],
  'Nature': ['wood', 'tree', 'forest', 'branch', 'rose', 'flower', 'water', 'sun', 'moon', 'mountain'],
  'Family': ['brother', 'sister', 'mother', 'father', 'son', 'daughter', 'child', 'wife', 'husband'],
  'Adventure': ['travel', 'world', 'journey', 'quest', 'tailor', 'peasant', 'huntsman'],
  'Cleverness': ['clever', 'wise', 'riddle', 'trick', 'cunning', 'fool', 'lazy'],
  'Supernatural': ['elves', 'giant', 'nix', 'spirit', 'ghost', 'dwarf', 'goblin']
};

stories.forEach(story => {
  const title = story.title.toLowerCase();
  let tags = new Set();
  
  for (const [tag, words] of Object.entries(keywords)) {
    if (words.some(w => title.includes(w))) {
      tags.add(tag);
    }
  }
  
  // Add some fallback tags if empty
  if (tags.size === 0) {
    if (parseInt(story.id) % 3 === 0) tags.add('Folklore');
    else if (parseInt(story.id) % 2 === 0) tags.add('Classic');
    else tags.add('Fable');
  }
  
  story.tags = Array.from(tags).slice(0, 3); // max 3 tags
});

fs.writeFileSync('./src/stories.json', JSON.stringify(stories, null, 2));
