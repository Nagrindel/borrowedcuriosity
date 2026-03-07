import fs from "fs";

let f = fs.readFileSync("server/nicole-posts.ts", "utf8");

const fixes = [
  ["the-distinctions-nash-equilibrium-vs-dominant-strategy", "Curiosity"],
  ["the-intricate-dance-of-opia-and-vulnerability", "Psychology"],
  ["uncovering-the-puzzle-exploring-psych-meds", "Wellness"],
  ["the-under-the-radar-path-to-liberation", "Lifestyle"],
  ["breaking-free-understanding-and-embracing-local-sovereignty", "Lifestyle"],
  ["what-lies-beyond-laughter-exploring-the-depths-of-dreams", "Psychology"],
  ["the-power-of-vulnerability-exploring-the-intricacies-of-opia", "Psychology"],
  ["unlocking-your-potential-embracing-personal-growth", "Lifestyle"],
  ["the-resurgence-of-ancient-herbal-medicine", "Wellness"],
  ["mysteries-of-consciousness-chakras-as-filters", "Spirituality"],
  ["the-uncharted-frontiers-of-mental-health", "Wellness"],
  ["exploring-the-depths-of-sonder", "Psychology"],
  ["the-mystery-of-limerence-exploring-the-depths-of-love", "Psychology"],
  ["how-addicted-are-we-to-our-phones", "Curiosity"],
  ["is-it-just-me-or-does-everything-feel-like-a-personal-attack", "Psychology"],
  ["chakras-are-they-real-or-just-trippy-marketing", "Spirituality"],
  ["adderall-the-prescription-with-benefits", "Curiosity"],
  ["healing-with-crystals-magic-energy-sources", "Crystals"],
  ["dmt-the-psychedelic-thats-got-everyone", "Curiosity"],
  ["why-do-i-always-forget-what-i-came-into-this-room", "Psychology"],
  ["having-a-bad-trip-dont-worry", "Curiosity"],
  ["why-do-i-feel-like-everyone-hates-me", "Psychology"],
  ["mushrooms-vs-lsd-which-psychedelic", "Curiosity"],
  ["is-my-phone-listening-to-me", "Curiosity"],
  ["how-to-tell-if-youre-actually-enlightened", "Curiosity"],
  ["why-do-we-feel-the-overwhelming-urge-to-squeeze", "Psychology"],
  ["is-your-grudge-holding-you-back", "Psychology"],
  ["the-existential-crisis-you-never-knew-you-needed", "Curiosity"],
  ["can-my-friends-hear-my-thoughts-right-now", "Curiosity"],
  ["game-theory-a-guide-to-the-intriguing-world", "Curiosity"],
  ["the-mystery-behind-alcohol-rejection", "Lifestyle"],
  ["embracing-optimism-how-chatgpts-encouragement", "Lifestyle"],
  ["the-evolution-of-religion-and-spirituality", "Spirituality"],
  ["the-invisible-foe-exploring-paranoia-and-fear", "Psychology"],
  ["brains-superpowers-unconventional-ways", "Curiosity"],
  ["the-secrets-to-mastering-your-personal-energy", "Wellness"],
  ["the-mysterious-realm-of-default-mode-network", "Curiosity"],
  ["why-do-i-always-forget-what-i-came-into-this-room", "Psychology"],
  ["deeper-than-the-galaxy", "Spirituality"],
  ["my-higher-self-ghosted-me", "Spirituality"],
  ["unschooling-rethinking-education", "Lifestyle"],
  ["why-do-we-feel-the-overwhelming-urge-to-squeeze-something-cute", "Psychology"],
  ["why-do-i-always-forget-what-i-came-into-this-room-for", "Psychology"],
  ["is-it-just-me-or-does-everything-feel-like", "Psychology"],
  ["the-universes-hidden-intentions", "Metaphysics"],
  ["philosophy-as-physics-the-metaphysical", "Metaphysics"],
  ["ancient-civilizations-as-time-travelers", "Metaphysics"],
  ["string-theory-and-the-fabric-of-existence", "Metaphysics"],
  ["quantum-superstition", "Metaphysics"],
  ["sound-as-the-blueprint-of-creation", "Spirituality"],
  ["what-is-energy-made-of", "Curiosity"],
  ["mysteries-of-schumann-resonances", "Curiosity"],
];

let count = 0;
for (const [slugPart, newCat] of fixes) {
  const slugIdx = f.indexOf(`"${slugPart}`);
  if (slugIdx === -1) continue;

  const chunk = f.substring(slugIdx, slugIdx + 20000);
  const catMatch = chunk.match(/category: "[^"]+"/);
  if (catMatch) {
    const catIdx = slugIdx + chunk.indexOf(catMatch[0]);
    const replacement = `category: "${newCat}"`;
    if (catMatch[0] !== replacement) {
      f = f.substring(0, catIdx) + replacement + f.substring(catIdx + catMatch[0].length);
      count++;
    }
  }
}

fs.writeFileSync("server/nicole-posts.ts", f);
console.log(`Fixed ${count} categories`);
