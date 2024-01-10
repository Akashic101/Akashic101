const fs = require('fs');
const Parser = require('rss-parser');

async function updateReadme() {

  console.log("Getting RSS-Feed");
  const parser = new Parser();
  const feed = await parser.parseURL('https://blog.davidmoll.net/feed.xml');

  console.log("Parsing RSS-Feed");
  const latestArticles = feed.items.slice(0, 3).map(item => `<li>
  <a href="${item.link}">${item.title}</a><br><i>${item.content}</i>
</li>`).join('\n');

  console.log("Reading content of README.md");
  const readmePath = 'README.md';
  let readmeContent = fs.readFileSync(readmePath, 'utf-8');

  console.log("Replacing placeholder with content")
  // Find and replace the RSS feed section
  const startTag = '<!-- RSS_FEED_SECTION_START -->';
  const startIndex = readmeContent.indexOf(startTag);

  if (startIndex !== -1) {
    const beforeSection = readmeContent.slice(0, startIndex + startTag.length);

    readmeContent = `${beforeSection}\n<ul>${latestArticles}</ul>`;
    console.log("Writing to file")
    fs.writeFileSync(readmePath, readmeContent.trim());
  } else {
    console.error('RSS feed section not found in README.md. Please add <!-- RSS_FEED_SECTION_START --> tag.');
  }
}

updateReadme();
