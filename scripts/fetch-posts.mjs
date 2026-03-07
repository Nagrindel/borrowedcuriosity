import https from "https";
import fs from "fs";

const API = "https://public-api.wordpress.com/rest/v1.1/sites/lucidlooper.com/posts/";
const PER_PAGE = 20;

function fetchPage(page) {
  return new Promise((resolve, reject) => {
    const url = `${API}?number=${PER_PAGE}&page=${page}&fields=ID,title,URL,content,date,slug,excerpt`;
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

function htmlToText(html) {
  let text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<h[1-6][^>]*>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "")
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-")
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u201C/g, '"')
    .replace(/\u201D/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text;
}

function excerptFromHtml(html) {
  return htmlToText(html).replace(/\n/g, " ").trim().substring(0, 200).replace(/\s+\S*$/, "...");
}

const categories = {
  numerology: "Numerology",
  name: "Numerology",
  frequency: "Spirituality",
  luck: "Spirituality",
  quartz: "Crystals",
  crystal: "Crystals",
  healing: "Crystals",
  aura: "Crystals",
  chakra: "Spirituality",
  meditation: "Wellness",
  energy: "Spirituality",
  quantum: "Metaphysics",
  multiverse: "Metaphysics",
  multidimensional: "Metaphysics",
  simulation: "Metaphysics",
  entanglement: "Metaphysics",
  string: "Metaphysics",
  dark_matter: "Metaphysics",
  time: "Metaphysics",
  consciousness: "Spirituality",
  psychedelic: "Curiosity",
  dmt: "Curiosity",
  mushroom: "Curiosity",
  lsd: "Curiosity",
  trip: "Curiosity",
  adderall: "Curiosity",
  psych: "Wellness",
  mental: "Wellness",
  paranoia: "Psychology",
  fear: "Psychology",
  vulnerability: "Psychology",
  opia: "Psychology",
  grudge: "Psychology",
  phone: "Curiosity",
  addiction: "Curiosity",
  game_theory: "Curiosity",
  nash: "Curiosity",
  liberation: "Lifestyle",
  sovereignty: "Lifestyle",
  alcohol: "Lifestyle",
  unschooling: "Lifestyle",
  education: "Lifestyle",
  optimism: "Lifestyle",
  religion: "Spirituality",
  herbal: "Wellness",
  brain: "Curiosity",
  memory: "Curiosity",
  dream: "Psychology",
  laughter: "Psychology",
  sonder: "Psychology",
  limerence: "Psychology",
  sound: "Spirituality",
  schumann: "Curiosity",
  default_mode: "Curiosity",
  cosmos: "Metaphysics",
  ancient: "Metaphysics",
  physics: "Metaphysics",
  higher_self: "Spirituality",
  personal_attack: "Psychology",
  cute: "Psychology",
  forget: "Psychology",
  hate: "Psychology",
  enlightened: "Curiosity",
  squeeze: "Psychology",
  galaxy: "Spirituality",
};

function categorize(title, content) {
  const text = (title + " " + content).toLowerCase();
  for (const [key, cat] of Object.entries(categories)) {
    if (text.includes(key.replace(/_/g, " "))) return cat;
  }
  return "Curiosity";
}

const gradients = [
  "from-emerald-400 to-teal-700", "from-violet-400 to-purple-700", "from-pink-400 to-fuchsia-700",
  "from-amber-400 to-orange-700", "from-cyan-400 to-blue-700", "from-indigo-400 to-violet-700",
  "from-teal-400 to-emerald-700", "from-rose-400 to-red-700", "from-purple-400 to-indigo-700",
  "from-sky-400 to-cyan-700", "from-orange-400 to-red-700", "from-yellow-400 to-amber-700",
  "from-lime-400 to-green-700", "from-fuchsia-400 to-pink-700", "from-blue-400 to-indigo-700",
  "from-red-400 to-rose-700", "from-green-400 to-teal-700", "from-stone-400 to-neutral-700",
  "from-amber-400 to-yellow-700", "from-gray-400 to-slate-700",
];

const images = [
  "photo-1507413245164-6160d8298b31", "photo-1470071459604-3b5ec3a7fe05", "photo-1506905925346-21bda4d32df4",
  "photo-1441974231531-c6227db76b6e", "photo-1457369804613-52c61a468e7d", "photo-1519681393784-d120267933ba",
  "photo-1499209974431-9dddcece7f88", "photo-1472214103451-9374bd1c798e", "photo-1532693322450-2cb5c511067d",
  "photo-1501139083538-0139583c060f", "photo-1509316785289-025f5b846b35", "photo-1509228468518-180dd4864904",
  "photo-1516575150508-2c232b78af8c", "photo-1451187580459-43490279c0fa", "photo-1545987796-200d6e5c12b3",
  "photo-1489549132488-d00b7eee80f1", "photo-1518709268805-4e9042af9f23", "photo-1509973385458-f9609a88a75a",
  "photo-1534447677768-be436bb09401", "photo-1490730141103-6cac27aaab94", "photo-1525909002-1b05e0c869d8",
  "photo-1506126613408-eca07ce68773", "photo-1507003211169-0a1dd7228f2d", "photo-1529333166437-7750a6dd5a70",
  "photo-1516589178581-6cd7833ae3b2", "photo-1499750310107-5fef28a66643", "photo-1507838153414-b4b713384a76",
  "photo-1508672019048-805c876b67e2", "photo-1456513080510-7bf3a84b82f8", "photo-1494972308805-463bc619d34e",
  "photo-1518199266791-5375a83190b7", "photo-1484480974693-6ca0a78fb36b", "photo-1519975258993-60b42d1c2ee2",
  "photo-1456406644174-8ddd4cd52a06", "photo-1509228627152-72ae9ae6848d", "photo-1454165804606-c3d57bc86b40",
  "photo-1516534775068-ba3e7458af70", "photo-1464746133101-a2c3f88e0dd9", "photo-1455390582262-044cdead277a",
  "photo-1498837167922-ddd27525d352", "photo-1507842217343-583bb7270b66", "photo-1504531342916-3282c0a6ec10",
  "photo-1522881193457-37ae97c905bf", "photo-1507120410856-1f35574c3b45", "photo-1502481851512-e9e2529b8c3f",
  "photo-1517842645767-c639042777db", "photo-1513364776144-60967b0f800f", "photo-1512850183-6d7990f42385",
  "photo-1475924156734-496f6cac6ec1", "photo-1492681290082-e932832941e6", "photo-1494500764479-0c8f2919a3d8",
  "photo-1464822759023-fed622ff2c3b", "photo-1503023345310-bd7c1de61c7d", "photo-1446776811953-b23d57bd21aa",
  "photo-1488190211105-8b0e65b80b4e", "photo-1473830394358-91588751b241", "photo-1462331940025-496dfbfc7564",
  "photo-1465101162946-4377e57745c3", "photo-1485550409059-9afb054cada4", "photo-1528360983277-13d401cdc186",
  "photo-1502809737437-1d85c70dd202",
];

function readingTime(content) {
  const words = content.split(/\s+/).length;
  const mins = Math.max(3, Math.ceil(words / 200));
  return `${mins} min read`;
}

async function main() {
  console.log("Fetching all posts from lucidlooper.com...");
  const allPosts = [];

  for (let page = 1; page <= 4; page++) {
    const result = await fetchPage(page);
    allPosts.push(...result.posts);
    console.log(`Page ${page}: ${result.posts.length} posts (total: ${allPosts.length})`);
    if (allPosts.length >= result.found) break;
  }

  console.log(`\nTotal posts fetched: ${allPosts.length}\n`);

  const entries = allPosts.map((post, i) => {
    const title = htmlToText(post.title).replace(/"/g, '\\"');
    const content = htmlToText(post.content);
    const excerpt = excerptFromHtml(post.excerpt || post.content);
    const category = categorize(post.title, content);
    const gradient = gradients[i % gradients.length];
    const imageId = images[i % images.length];
    const imageUrl = `https://images.unsplash.com/${imageId}?w=800&q=80`;

    return {
      title,
      slug: post.slug,
      excerpt,
      content,
      category,
      readingTime: readingTime(content),
      gradient,
      imageUrl,
    };
  });

  let ts = "export const NICOLE_BLOG_POSTS = [\n";
  for (const entry of entries) {
    const escapedContent = entry.content
      .replace(/\\/g, "\\\\")
      .replace(/`/g, "\\`")
      .replace(/\$/g, "\\$");
    const escapedTitle = entry.title.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
    const escapedExcerpt = entry.excerpt.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");

    ts += `  {\n`;
    ts += `    title: \`${escapedTitle}\`,\n`;
    ts += `    slug: "${entry.slug}",\n`;
    ts += `    excerpt: \`${escapedExcerpt}\`,\n`;
    ts += `    content: \`${escapedContent}\`,\n`;
    ts += `    category: "${entry.category}",\n`;
    ts += `    readingTime: "${entry.readingTime}",\n`;
    ts += `    gradient: "${entry.gradient}",\n`;
    ts += `    imageUrl: "${entry.imageUrl}",\n`;
    ts += `  },\n`;
  }
  ts += "];\n";

  fs.writeFileSync("server/nicole-posts.ts", ts);
  console.log(`\nWrote ${entries.length} posts to server/nicole-posts.ts`);
  entries.forEach((e, i) => console.log(`  ${i + 1}. ${e.title} [${e.category}] (${e.readingTime}, ${e.content.length} chars)`));
}

main().catch(console.error);
