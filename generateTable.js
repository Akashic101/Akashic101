const fs = require("fs");
const Parser = require("rss-parser");
const axios = require("axios");
const parser = new Parser();

const feedUrl = "https://blog.davidmoll.net/feed.xml";
const feedPath = "./data/feed.xml";

async function downloadFeed() {
  try {
    // Fetch the RSS feed from the URL
    const response = await axios.get(feedUrl);
    // Ensure the data directory exists
    if (!fs.existsSync("./data")) {
      fs.mkdirSync("./data");
    }
    // Save the RSS feed to a file
    fs.writeFileSync(feedPath, response.data);
    console.log("RSS feed downloaded successfully!");
  } catch (error) {
    console.error("Error downloading RSS feed:", error);
    throw error; // Rethrow to stop further execution if download fails
  }
}

async function generateGallery() {
  try {
    // Download the RSS feed
    await downloadFeed();

    // Read the RSS file from the local path
    const feedXml = fs.readFileSync(feedPath, "utf8");
    const feed = await parser.parseString(feedXml);
    const posts = feed.items.slice(0, 4);

    const generateBadge = (label) => {
      const baseUrl = "https://img.shields.io/badge/";
      const style = "flat-square";

      // URL-encode the label to handle special characters
      const encodedLabel = encodeURIComponent(label);
      return `${baseUrl}${encodedLabel}-blue?style=${style}`;
    };

    const htmlContent = `
<div id="gallery">
  <div align="center">
    <table width="75%">
      <tr>
        ${posts
          .map((post) => {
            const imageUrl =
              post.link.replace(
                "https://blog.davidmoll.net/blog/",
                "https://blog.davidmoll.net/assets/images/"
              ) + "/cover.png";
            const categories = post.categories || [];
            const badges = categories
              .map((category) => {
                const badgeUrl = generateBadge(category);
                return `<img src="${badgeUrl}" alt="${category}" /> `;
              })
              .join(" ");

            return `<td width="25%" valign="top" style="padding-top: 20px; padding-bottom: 20px; padding-left: 30px; padding-right: 30px;">
            <a href="${post.link}"><img src="${imageUrl}" alt="${
              post.title
            }" /></a>
            <p><b><a href="${post.link}">${post.title}</a></b></p>
            <p>${post.contentSnippet || ""}</p>
            ${badges} 
          </td>`;
          })
          .join("")}
      </tr>
      <tr>
      </tr>
    </table>
  </div>
</div>`;

    let readmeContent = fs.readFileSync("README.md", "utf8");
    const startMarker = "<!--START_SECTION:feed-->";
    const endMarker = "<!--END_SECTION:feed-->";
    const startIndex = readmeContent.indexOf(startMarker) + startMarker.length;
    const endIndex = readmeContent.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("Markers not found in README.md");
    }

    const updatedReadmeContent = `${readmeContent.slice(
      0,
      startIndex
    )}\n${htmlContent}\n${readmeContent.slice(endIndex)}`;
    fs.writeFileSync("README.md", updatedReadmeContent);

    console.log("README.md updated successfully!");
  } catch (error) {
    console.error("Error generating gallery:", error);
  }
}

generateGallery();
