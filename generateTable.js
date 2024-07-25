const fs = require("fs");
const Parser = require("rss-parser");
const parser = new Parser();

const feedUrl = "https://blog.davidmoll.net/feed.xml";

async function generateGallery() {
  try {
    const feed = await parser.parseURL(feedUrl);
    const posts = feed.items.slice(0, 4);

    const generateBadge = (label) => {
      const baseUrl = "https://img.shields.io/badge/";
      const style = "flat-square";
      const replacedLabel = label.replace("-", "_");

      return `${baseUrl}${replacedLabel}-blue?style=${style}`;
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
                console.log(badgeUrl);
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
