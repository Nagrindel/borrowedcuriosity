export interface BiblicalVerse {
  reference: string;
  text: string;
  numericalValue: number;
  themes: string[];
  lifePaths: number[];
}

export const BIBLICAL_VERSES: BiblicalVerse[] = [
  { reference: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.", numericalValue: 518, themes: ["hope", "future", "planning", "prosperity"], lifePaths: [1, 3, 8] },
  { reference: "Philippians 4:13", text: "I can do all things through Christ who strengthens me.", numericalValue: 247, themes: ["strength", "capability", "faith", "empowerment"], lifePaths: [1, 8, 11] },
  { reference: "Romans 8:28", text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", numericalValue: 441, themes: ["purpose", "good", "love", "calling"], lifePaths: [2, 6, 9] },
  { reference: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.", numericalValue: 658, themes: ["trust", "understanding", "guidance", "wisdom"], lifePaths: [7, 11, 22] },
  { reference: "Isaiah 40:31", text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.", numericalValue: 523, themes: ["hope", "renewal", "strength", "endurance"], lifePaths: [4, 5, 9] },
  { reference: "Matthew 6:33", text: "But seek first his kingdom and his righteousness, and all these things will be given to you as well.", numericalValue: 386, themes: ["seeking", "kingdom", "righteousness", "provision"], lifePaths: [7, 9, 11] },
  { reference: "Psalm 23:1", text: "The Lord is my shepherd, I lack nothing.", numericalValue: 185, themes: ["shepherd", "provision", "care", "sufficiency"], lifePaths: [2, 6, 8] },
  { reference: "1 Corinthians 13:13", text: "And now these three remain: faith, hope and love. But the greatest of these is love.", numericalValue: 312, themes: ["faith", "hope", "love", "greatest"], lifePaths: [2, 6, 9] },
  { reference: "Joshua 1:9", text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", numericalValue: 627, themes: ["courage", "strength", "presence", "fearlessness"], lifePaths: [1, 5, 8] },
  { reference: "Psalm 46:10", text: "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.", numericalValue: 374, themes: ["stillness", "knowing", "exaltation", "peace"], lifePaths: [7, 11, 33] },
  { reference: "Ephesians 2:10", text: "For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.", numericalValue: 445, themes: ["handiwork", "creation", "good works", "preparation"], lifePaths: [3, 4, 22] },
  { reference: "2 Timothy 1:7", text: "For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.", numericalValue: 358, themes: ["spirit", "power", "love", "discipline"], lifePaths: [1, 6, 8] },
  { reference: "Psalm 139:14", text: "I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.", numericalValue: 492, themes: ["praise", "wonderful", "works", "knowledge"], lifePaths: [3, 7, 9] },
  { reference: "John 3:16", text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", numericalValue: 587, themes: ["love", "sacrifice", "belief", "eternal life"], lifePaths: [2, 6, 9] },
  { reference: "Galatians 6:9", text: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.", numericalValue: 419, themes: ["perseverance", "good", "harvest", "timing"], lifePaths: [4, 8, 9] },
  { reference: "1 Peter 5:7", text: "Cast all your anxiety on him because he cares for you.", numericalValue: 246, themes: ["anxiety", "casting", "care", "burden"], lifePaths: [2, 6, 7] },
  { reference: "Psalm 119:105", text: "Your word is a lamp for my feet and a light for my path.", numericalValue: 273, themes: ["word", "lamp", "light", "path"], lifePaths: [7, 11, 22] },
  { reference: "Romans 12:2", text: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind.", numericalValue: 712, themes: ["transformation", "renewal", "mind", "will"], lifePaths: [7, 11, 33] },
  { reference: "Colossians 3:23", text: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.", numericalValue: 421, themes: ["work", "heart", "service", "masters"], lifePaths: [4, 6, 8] },
  { reference: "Isaiah 41:10", text: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you.", numericalValue: 651, themes: ["fearlessness", "presence", "strength", "help"], lifePaths: [1, 2, 8] },
];

export function getVerseByLifePath(lifePath: number): BiblicalVerse {
  const matches = BIBLICAL_VERSES.filter(v => v.lifePaths.includes(lifePath));
  return matches.length > 0
    ? matches[Math.floor(Math.random() * matches.length)]
    : BIBLICAL_VERSES[Math.floor(Math.random() * BIBLICAL_VERSES.length)];
}

export function getVerseByTheme(theme: string): BiblicalVerse {
  const matches = BIBLICAL_VERSES.filter(v => v.themes.some(t => t.toLowerCase().includes(theme.toLowerCase())));
  return matches.length > 0
    ? matches[Math.floor(Math.random() * matches.length)]
    : BIBLICAL_VERSES[Math.floor(Math.random() * BIBLICAL_VERSES.length)];
}
