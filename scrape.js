import fs from 'fs';
import https from 'https';
import path from 'path';

const markdownPath = '/Users/brian/.gemini/antigravity/brain/834139c1-63f4-4082-9d0e-d5ace449d8b1/.system_generated/steps/91/content.md';
const outputDir = './public/stories';
const indexFile = './src/stories.json';

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  const mdContent = fs.readFileSync(markdownPath, 'utf8');
  const regex = /-\s+\[(.*?)\]\((https:\/\/www\.cs\.cmu\.edu\/~spok\/grimmtmp\/(\d{3})\.txt)\)/g;
  
  let match;
  const stories = [];
  while ((match = regex.exec(mdContent)) !== null) {
    stories.push({
      title: match[1],
      url: match[2],
      id: match[3]
    });
  }

  console.log(`Found ${stories.length} stories in markdown.`);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const indexData = [];

  for (let i = 0; i < stories.length; i++) {
    const story = stories[i];
    console.log(`Downloading ${story.id}.txt... (${i+1}/${stories.length})`);
    
    try {
      const text = await fetchUrl(story.url);
      const cleanedText = text.replace(/\r\n/g, '\n');
      
      fs.writeFileSync(path.join(outputDir, `${story.id}.txt`), cleanedText);
      
      const wordCount = cleanedText.split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));
      
      indexData.push({
        id: story.id,
        title: story.title,
        readingTime: readingTime
      });
    } catch (e) {
      console.error(`Failed to download ${story.url}:`, e);
    }
    
    // small delay to be polite to the server
    await new Promise(r => setTimeout(r, 100));
  }
  
  fs.writeFileSync(indexFile, JSON.stringify(indexData, null, 2));
  console.log('Done downloading and generating index!');
}

run();
