import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Moon,
  Eye,
  Leaf,
  Droplets,
  Wind,
  Zap,
  Shield,
  Heart,
  Star,
  Sun,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ShoppingBag,
  AlertTriangle,
  Check,
  BookOpen,
} from "lucide-react";
import { Link } from "wouter";

type SafetyLevel = "generally-safe" | "use-caution" | "consult-practitioner";

interface Herb {
  name: string;
  latin: string;
  forms: string[];
  preparation: string;
  timeline: string;
  safety: SafetyLevel;
  contraindications: string;
  storeMatch: boolean;
}

interface Category {
  name: string;
  icon: typeof Flame;
  symptoms: string[];
}

const CATEGORIES: Category[] = [
  { name: "Pain and Inflammation", icon: Flame,
    symptoms: ["Headache", "Muscle Pain", "Joint Pain", "Menstrual Cramps", "Back Pain"] },
  { name: "Sleep and Relaxation", icon: Moon,
    symptoms: ["Insomnia", "Restlessness", "Racing Thoughts", "Light Sleep", "Nighttime Anxiety"] },
  { name: "Stress and Anxiety", icon: Eye,
    symptoms: ["General Anxiety", "Nervous Tension", "Overwhelm", "Panic", "Worry"] },
  { name: "Digestive Health", icon: Leaf,
    symptoms: ["Nausea", "Bloating", "Indigestion", "Constipation", "Stomach Cramps"] },
  { name: "Skin Care", icon: Droplets,
    symptoms: ["Eczema", "Minor Burns", "Cuts and Wounds", "Dry Skin", "Rashes", "Acne"] },
  { name: "Respiratory", icon: Wind,
    symptoms: ["Cough", "Congestion", "Sore Throat", "Seasonal Allergies", "Sinus Pressure"] },
  { name: "Energy and Focus", icon: Zap,
    symptoms: ["Fatigue", "Brain Fog", "Low Motivation", "Afternoon Slump"] },
  { name: "Immune Support", icon: Shield,
    symptoms: ["Cold and Flu Onset", "Frequent Illness", "Post-Illness Recovery"] },
  { name: "Emotional Balance", icon: Heart,
    symptoms: ["Grief", "Sadness", "Irritability", "Mood Swings"] },
  { name: "Women's Health", icon: Star,
    symptoms: ["PMS", "Hot Flashes", "Menstrual Irregularity", "Breast Tenderness"] },
  { name: "Circulation", icon: Sun,
    symptoms: ["Cold Hands and Feet", "Swelling", "Heavy Legs"] },
  { name: "Detox and Cleansing", icon: Sparkles,
    symptoms: ["Liver Support", "Water Retention", "Sluggishness", "Seasonal Cleanse"] },
];

const QUICK_REFERENCE = [
  {
    title: "Making Herbal Tea",
    content:
      "Use 1 teaspoon of dried herb (or 1 tablespoon fresh) per cup of water. Pour boiling water over the herb and steep for 5 to 10 minutes with a cover to retain volatile oils. Strain and drink warm. For roots and bark, simmer gently for 15 to 20 minutes instead of steeping.",
  },
  {
    title: "Tincture Basics",
    content:
      "Tinctures are concentrated herbal extracts preserved in alcohol or glycerin. The standard dose is 30 to 60 drops (about 1 to 2 dropperfuls) in a small glass of water, taken 2 to 3 times daily. Hold under the tongue briefly for faster absorption. Store in a cool, dark place.",
  },
  {
    title: "Compress Method",
    content:
      "Brew a strong herbal tea using double the normal amount of herb. Soak a clean cloth in the warm liquid, wring out the excess, and apply to the affected area for 15 to 20 minutes. For cold compresses, chill the tea first. Repeat several times daily as needed.",
  },
  {
    title: "Salve Application",
    content:
      "Clean and dry the affected area before applying a thin layer of herbal salve. Massage gently in circular motions to promote absorption. Reapply 2 to 3 times daily or as needed. For best results, apply after bathing when skin is warm and pores are open.",
  },
  {
    title: "Safety First",
    content:
      "Start with small doses to test for sensitivity. Pregnant or nursing individuals should consult a healthcare provider before using any herbal remedy. Herbs can interact with prescription medications. If you experience any adverse reaction, discontinue use immediately and seek medical attention.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const SYMPTOM_HERBS: Record<string, Herb[]> = {
  // ── Pain and Inflammation ──────────────────────────────────────────
  "Headache": [
    { name: "White Willow Bark", latin: "Salix alba", forms: ["Tea", "Capsule", "Tincture"],
      preparation: "Steep 1 to 2 teaspoons of dried bark in boiling water for 10 to 15 minutes. Strain and drink up to 3 cups daily. This is a natural source of salicin, which works similarly to aspirin for pain relief.",
      timeline: "Within 1 to 2 hours", safety: "use-caution",
      contraindications: "Contains salicin, related to aspirin. Avoid with aspirin allergy, blood-thinning medications, or for children under 18.", storeMatch: false },
    { name: "Peppermint", latin: "Mentha piperita", forms: ["Essential Oil", "Tea", "Compress"],
      preparation: "Dilute peppermint essential oil with a carrier oil and apply to the temples and forehead. Alternatively, brew a strong peppermint tea and inhale the steam while sipping slowly.",
      timeline: "Within 15 to 30 minutes for topical application", safety: "generally-safe",
      contraindications: "Avoid applying undiluted essential oil directly to skin. Not recommended for children under 6.", storeMatch: true },
    { name: "Feverfew", latin: "Tanacetum parthenium", forms: ["Capsule", "Tea", "Tincture"],
      preparation: "Take 50 to 100mg of dried feverfew leaf daily as a preventive measure. For acute headaches, brew 1 teaspoon of dried leaves in hot water for 10 minutes and drink.",
      timeline: "Preventive use requires 4 to 6 weeks of daily intake. Acute relief within 1 to 2 hours.", safety: "use-caution",
      contraindications: "Avoid during pregnancy as it may stimulate uterine contractions. Do not combine with blood-thinning medications.", storeMatch: false },
    { name: "Lavender", latin: "Lavandula angustifolia", forms: ["Essential Oil", "Tea", "Compress"],
      preparation: "Apply diluted lavender oil to temples and the back of the neck. For a calming approach, add 3 to 5 drops to a warm compress and place over the forehead while resting in a quiet space.",
      timeline: "Within 15 to 30 minutes", safety: "generally-safe",
      contraindications: "", storeMatch: true },
  ],
  "Muscle Pain": [
    { name: "Arnica", latin: "Arnica montana", forms: ["Salve", "Compress", "Bath"],
      preparation: "Apply arnica salve or cream directly to sore muscles 2 to 3 times daily. For broader relief, add arnica tincture to a warm bath and soak for 20 minutes.",
      timeline: "Topical relief within 30 to 60 minutes", safety: "use-caution",
      contraindications: "For external use only. Never apply to broken skin or open wounds. Do not take internally unless using a homeopathic preparation.", storeMatch: true },
    { name: "Turmeric", latin: "Curcuma longa", forms: ["Tea", "Capsule", "Paste"],
      preparation: "Mix 1 teaspoon of turmeric powder with warm milk and a pinch of black pepper to enhance absorption. Drink this golden milk twice daily. For topical use, make a paste with turmeric and warm water.",
      timeline: "2 to 3 days of consistent use for noticeable relief", safety: "generally-safe",
      contraindications: "High doses may interact with blood thinners. Avoid large supplemental doses if you have gallbladder issues.", storeMatch: false },
    { name: "Ginger", latin: "Zingiber officinale", forms: ["Tea", "Compress", "Bath"],
      preparation: "Grate 1 inch of fresh ginger root into a cup of hot water and steep for 10 minutes. For a warming compress, soak a cloth in strong ginger tea and apply to the affected area.",
      timeline: "Within 20 to 40 minutes for tea; immediate warmth from compress", safety: "generally-safe",
      contraindications: "May interact with blood thinners. Limit to 4 grams daily during pregnancy.", storeMatch: false },
    { name: "Cayenne", latin: "Capsicum annuum", forms: ["Salve", "Compress", "Tincture"],
      preparation: "Apply a capsaicin-based cream or cayenne salve to the sore area. Start with a small patch test. The heat draws blood to the area and blocks pain signals over time.",
      timeline: "Warming sensation within minutes; pain relief builds over several days of regular use", safety: "use-caution",
      contraindications: "Avoid contact with eyes, mucous membranes, and broken skin. Wash hands thoroughly after application.", storeMatch: false },
  ],
  "Joint Pain": [
    { name: "Turmeric", latin: "Curcuma longa", forms: ["Capsule", "Tea", "Paste"],
      preparation: "Take 400 to 600mg of standardized curcumin extract twice daily with meals. Always pair with black pepper or a fat source to enhance bioavailability. Consistency is key for joint support.",
      timeline: "4 to 8 weeks of daily use for significant improvement", safety: "generally-safe",
      contraindications: "May interact with blood thinners and diabetes medications. Avoid large doses with gallbladder disease.", storeMatch: false },
    { name: "Boswellia", latin: "Boswellia serrata", forms: ["Capsule", "Tincture"],
      preparation: "Take 300 to 500mg of standardized Boswellia extract (containing at least 60% boswellic acids) three times daily with food. This resin has been used in Ayurvedic medicine for centuries.",
      timeline: "2 to 4 weeks of consistent use", safety: "generally-safe",
      contraindications: "May interact with anti-inflammatory medications. Consult a practitioner if pregnant or nursing.", storeMatch: false },
    { name: "Nettle", latin: "Urtica dioica", forms: ["Tea", "Capsule", "Tincture"],
      preparation: "Brew 2 teaspoons of dried nettle leaf in boiling water for 10 minutes. Drink 3 cups daily. Nettle is rich in minerals and has a long history of use for joint inflammation.",
      timeline: "1 to 2 weeks of regular use", safety: "generally-safe",
      contraindications: "May lower blood sugar levels. Use with caution if on diabetes or blood pressure medications.", storeMatch: false },
    { name: "Devil's Claw", latin: "Harpagophytum procumbens", forms: ["Capsule", "Tea", "Tincture"],
      preparation: "Take 600 to 1200mg of dried root extract daily, divided into two doses. For tea, simmer 1 teaspoon of chopped root in water for 15 minutes and strain.",
      timeline: "2 to 4 weeks of daily use", safety: "use-caution",
      contraindications: "Avoid with stomach ulcers or gallstones. May interact with blood thinners and heart medications.", storeMatch: false },
  ],
  "Menstrual Cramps": [
    { name: "Cramp Bark", latin: "Viburnum opulus", forms: ["Tincture", "Tea", "Capsule"],
      preparation: "Take 30 to 60 drops of cramp bark tincture in water every 2 to 3 hours during cramping. For tea, simmer 1 tablespoon of dried bark in 2 cups of water for 15 minutes.",
      timeline: "Within 30 to 60 minutes", safety: "generally-safe",
      contraindications: "Limited safety data during pregnancy. Consult a practitioner before use if pregnant.", storeMatch: false },
    { name: "Ginger", latin: "Zingiber officinale", forms: ["Tea", "Capsule", "Compress"],
      preparation: "Brew strong ginger tea with 2 inches of sliced fresh root in 2 cups of water, simmered for 15 minutes. Drink throughout the day. Apply a warm ginger compress to the lower abdomen for added relief.",
      timeline: "Within 30 minutes for tea; immediate warmth from compress", safety: "generally-safe",
      contraindications: "Limit to 4 grams daily. May increase bleeding if taken with blood thinners.", storeMatch: false },
    { name: "Raspberry Leaf", latin: "Rubus idaeus", forms: ["Tea", "Capsule", "Tincture"],
      preparation: "Steep 1 to 2 teaspoons of dried raspberry leaf in boiling water for 10 minutes. Drink 2 to 3 cups daily during the menstrual period. Best results come from regular use throughout the cycle.",
      timeline: "Cumulative effect over 1 to 2 cycles of regular use", safety: "generally-safe",
      contraindications: "Traditionally avoided in the first trimester of pregnancy. Generally considered safe otherwise.", storeMatch: false },
    { name: "Chamomile", latin: "Matricaria chamomilla", forms: ["Tea", "Essential Oil", "Bath"],
      preparation: "Brew a strong chamomile tea using 2 teaspoons of dried flowers per cup. Steep covered for 10 minutes. Drink up to 4 cups daily. Add chamomile essential oil to a warm bath for full-body relaxation.",
      timeline: "Within 30 to 45 minutes", safety: "generally-safe",
      contraindications: "Avoid if allergic to plants in the daisy family (Asteraceae). May increase the effect of blood-thinning medications.", storeMatch: true },
  ],
  "Back Pain": [
    { name: "White Willow Bark", latin: "Salix alba", forms: ["Tea", "Capsule", "Tincture"],
      preparation: "Take 240mg of standardized willow bark extract daily, or steep 2 teaspoons of dried bark in boiling water for 15 minutes. Drink 2 to 3 cups daily for sustained relief.",
      timeline: "Within 1 to 2 hours", safety: "use-caution",
      contraindications: "Contains salicin. Avoid with aspirin allergy, blood-thinning drugs, kidney disease, or for children under 18.", storeMatch: false },
    { name: "Devil's Claw", latin: "Harpagophytum procumbens", forms: ["Capsule", "Tincture"],
      preparation: "Take 50 to 100mg of harpagoside (the active compound) daily via standardized extract. Studies have shown its effectiveness for lower back discomfort when taken consistently.",
      timeline: "4 to 8 weeks of daily use for best results", safety: "use-caution",
      contraindications: "Avoid with peptic ulcers, gallstones, or heart conditions. May interact with blood-thinning and heart medications.", storeMatch: false },
    { name: "Turmeric", latin: "Curcuma longa", forms: ["Capsule", "Tea", "Paste"],
      preparation: "Take 500mg of curcumin extract with black pepper twice daily. For topical support, mix turmeric powder with warm coconut oil into a paste and apply to the lower back.",
      timeline: "1 to 2 weeks of consistent internal use", safety: "generally-safe",
      contraindications: "May interact with blood thinners. Avoid supplemental doses with gallbladder problems.", storeMatch: false },
    { name: "Arnica", latin: "Arnica montana", forms: ["Salve", "Compress"],
      preparation: "Massage arnica salve into the lower back 2 to 3 times daily. For deeper relief, apply a warm arnica compress and rest for 20 minutes. Works best for strain-related back pain.",
      timeline: "Within 30 to 60 minutes of topical application", safety: "use-caution",
      contraindications: "External use only. Never apply to broken skin. Do not ingest unless using homeopathic dilutions.", storeMatch: true },
  ],

  // ── Sleep and Relaxation ───────────────────────────────────────────
  "Insomnia": [
    { name: "Valerian", latin: "Valeriana officinalis", forms: ["Capsule", "Tea", "Tincture"],
      preparation: "Take 300 to 600mg of valerian root extract 30 minutes to 2 hours before bedtime. For tea, steep 1 teaspoon of dried root in boiling water for 10 to 15 minutes. The taste is strong, so honey helps.",
      timeline: "Some feel effects the first night; full effectiveness develops over 2 to 4 weeks", safety: "generally-safe",
      contraindications: "May cause morning grogginess. Avoid combining with sedative medications or alcohol.", storeMatch: false },
    { name: "Passionflower", latin: "Passiflora incarnata", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Steep 1 teaspoon of dried passionflower in hot water for 10 minutes. Drink one cup 30 to 60 minutes before bed. Combines well with chamomile for enhanced calming effects.",
      timeline: "Within 30 to 60 minutes", safety: "generally-safe",
      contraindications: "Avoid with sedative medications. Not recommended during pregnancy.", storeMatch: false },
    { name: "Chamomile", latin: "Matricaria chamomilla", forms: ["Tea", "Tincture", "Bath"],
      preparation: "Brew 2 to 3 teaspoons of dried chamomile flowers in hot water for 10 minutes, covered. Drink 30 minutes before bed. For a sleep ritual, add 5 drops of chamomile essential oil to a warm evening bath.",
      timeline: "Within 30 to 45 minutes", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae (daisy family) allergy. May potentiate blood-thinning medications.", storeMatch: true },
    { name: "Hops", latin: "Humulus lupulus", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Steep 1 to 2 teaspoons of dried hops strobiles in hot water for 10 minutes. Often combined with valerian for stronger effect. A sachet of dried hops placed near your pillow is a traditional sleep aid.",
      timeline: "Within 30 to 60 minutes", safety: "generally-safe",
      contraindications: "May worsen depression in some individuals. Avoid with estrogen-sensitive conditions.", storeMatch: false },
  ],
  "Restlessness": [
    { name: "Lemon Balm", latin: "Melissa officinalis", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Steep 1 to 2 teaspoons of fresh or dried lemon balm leaves in hot water for 5 to 10 minutes. The pleasant lemony flavor makes it easy to drink. Take 2 to 3 cups throughout the evening.",
      timeline: "Within 30 to 45 minutes", safety: "generally-safe",
      contraindications: "May interact with thyroid medications and sedatives. Generally very well tolerated.", storeMatch: false },
    { name: "Skullcap", latin: "Scutellaria lateriflora", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Take 30 to 60 drops of skullcap tincture in water, or steep 1 to 2 teaspoons of dried herb in hot water for 10 minutes. Particularly effective for restlessness caused by nervous exhaustion.",
      timeline: "Within 20 to 40 minutes", safety: "generally-safe",
      contraindications: "Ensure you source genuine Scutellaria lateriflora, as adulteration with other species has occurred.", storeMatch: false },
    { name: "Oat Straw", latin: "Avena sativa", forms: ["Tea", "Tincture", "Bath"],
      preparation: "Steep 3 tablespoons of dried oat straw in a quart of hot water for at least 20 minutes (or overnight for a nourishing infusion). Drink throughout the day for gentle nervous system support.",
      timeline: "Cumulative benefits over 1 to 2 weeks of daily use", safety: "generally-safe",
      contraindications: "Generally safe for most people. Those with celiac disease should verify the source is gluten-free.", storeMatch: false },
    { name: "Lavender", latin: "Lavandula angustifolia", forms: ["Essential Oil", "Tea", "Bath"],
      preparation: "Add 5 to 8 drops of lavender essential oil to an evening bath, or place a few drops on your pillow. For tea, steep 1 teaspoon of dried lavender buds in hot water for 5 minutes.",
      timeline: "Within 15 to 20 minutes", safety: "generally-safe",
      contraindications: "", storeMatch: true },
  ],
  "Racing Thoughts": [
    { name: "Passionflower", latin: "Passiflora incarnata", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Take 40 to 60 drops of passionflower tincture in warm water when racing thoughts begin. For tea, steep 1 teaspoon of dried herb for 10 minutes. Passionflower is especially valued for calming an overactive mind.",
      timeline: "Within 20 to 40 minutes", safety: "generally-safe",
      contraindications: "Avoid combining with sedative medications. Not recommended during pregnancy.", storeMatch: false },
    { name: "Skullcap", latin: "Scutellaria lateriflora", forms: ["Tincture", "Tea", "Capsule"],
      preparation: "Take 30 to 60 drops of tincture up to 3 times daily, or steep 1 to 2 teaspoons of dried herb in hot water for 15 minutes. Known as a premier nervine for quieting mental chatter.",
      timeline: "Within 20 to 30 minutes", safety: "generally-safe",
      contraindications: "Source from reputable suppliers to avoid adulteration.", storeMatch: false },
    { name: "Lemon Balm", latin: "Melissa officinalis", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Brew a generous cup of lemon balm tea using 2 teaspoons of fresh or dried leaves. The rosmarinic acid in lemon balm has been studied for its calming effects on the nervous system.",
      timeline: "Within 30 to 45 minutes", safety: "generally-safe",
      contraindications: "May interact with thyroid medications.", storeMatch: false },
  ],
  "Light Sleep": [
    { name: "Valerian", latin: "Valeriana officinalis", forms: ["Capsule", "Tincture", "Tea"],
      preparation: "Take 400 to 600mg of valerian extract 1 hour before bed. Research suggests valerian increases GABA levels, helping deepen sleep cycles. Best results come after 2 weeks of nightly use.",
      timeline: "Noticeable deepening of sleep after 2 to 4 weeks of nightly use", safety: "generally-safe",
      contraindications: "May cause vivid dreams or morning drowsiness. Avoid with sedative drugs and alcohol.", storeMatch: false },
    { name: "Hops", latin: "Humulus lupulus", forms: ["Tincture", "Tea", "Capsule"],
      preparation: "Combine hops tincture with valerian for a synergistic effect: 30 drops of each in warm water before bed. For tea, steep 1 teaspoon of hops strobiles for 10 minutes.",
      timeline: "Within 30 to 60 minutes; best over 1 to 2 weeks of nightly use", safety: "generally-safe",
      contraindications: "May worsen depression symptoms. Avoid with estrogen-sensitive conditions.", storeMatch: false },
    { name: "Magnolia Bark", latin: "Magnolia officinalis", forms: ["Capsule", "Tincture"],
      preparation: "Take 200 to 400mg of magnolia bark extract 30 minutes before bed. The bioactive compounds honokiol and magnolol promote relaxation and support deeper sleep without heavy sedation.",
      timeline: "Within 30 to 60 minutes", safety: "use-caution",
      contraindications: "Avoid during pregnancy and nursing. May enhance the effects of sedative medications.", storeMatch: false },
  ],
  "Nighttime Anxiety": [
    { name: "Passionflower", latin: "Passiflora incarnata", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Brew 1 to 2 teaspoons of dried passionflower into a bedtime tea. Sip slowly 30 to 60 minutes before sleep. The mild sedative effect pairs well with a calming bedtime routine.",
      timeline: "Within 30 to 45 minutes", safety: "generally-safe",
      contraindications: "Avoid with sedative medications or during pregnancy.", storeMatch: false },
    { name: "Chamomile", latin: "Matricaria chamomilla", forms: ["Tea", "Essential Oil", "Bath"],
      preparation: "Make a double-strength chamomile tea with 2 tablespoons of dried flowers per cup. Steep covered for 15 minutes. Combine with a few drops of chamomile oil in an evening bath for deeper calming.",
      timeline: "Within 20 to 30 minutes", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy.", storeMatch: true },
    { name: "Lavender", latin: "Lavandula angustifolia", forms: ["Essential Oil", "Tea", "Bath"],
      preparation: "Diffuse lavender essential oil in the bedroom 30 minutes before sleep, or apply a diluted drop to the wrists and behind the ears. Studies show lavender inhalation reduces nighttime anxiety markers.",
      timeline: "Within 15 to 20 minutes of inhalation", safety: "generally-safe",
      contraindications: "", storeMatch: true },
    { name: "Ashwagandha", latin: "Withania somnifera", forms: ["Capsule", "Powder", "Tincture"],
      preparation: "Take 300mg of KSM-66 or Sensoril ashwagandha extract with warm milk before bed. This adaptogen helps regulate cortisol, the stress hormone that can spike at night and disrupt sleep.",
      timeline: "2 to 4 weeks of nightly use for consistent benefits", safety: "generally-safe",
      contraindications: "Avoid with thyroid medications unless supervised. Not recommended during pregnancy.", storeMatch: false },
  ],

  // ── Stress and Anxiety ─────────────────────────────────────────────
  "General Anxiety": [
    { name: "Ashwagandha", latin: "Withania somnifera", forms: ["Capsule", "Powder", "Tincture"],
      preparation: "Take 300 to 600mg of standardized root extract daily with food. Traditionally mixed into warm milk with a pinch of cinnamon. Ashwagandha helps the body adapt to stress and lowers cortisol levels.",
      timeline: "Noticeable effects within 2 to 4 weeks of daily use", safety: "generally-safe",
      contraindications: "Avoid with thyroid medications unless supervised by a practitioner. Not for use during pregnancy.", storeMatch: false },
    { name: "Holy Basil", latin: "Ocimum tenuiflorum", forms: ["Tea", "Capsule", "Tincture"],
      preparation: "Steep 1 to 2 teaspoons of dried holy basil (tulsi) in hot water for 5 to 10 minutes. Drink 2 to 3 cups daily. This revered Ayurvedic adaptogen supports a balanced stress response.",
      timeline: "Calming effects within days; full adaptogenic benefits over 4 to 6 weeks", safety: "generally-safe",
      contraindications: "May slow blood clotting. Avoid 2 weeks before surgery. May interact with blood-thinning drugs.", storeMatch: false },
    { name: "Passionflower", latin: "Passiflora incarnata", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Take 30 to 60 drops of tincture in water up to 3 times daily, or brew 1 teaspoon of dried herb for 10 minutes. Especially useful for anxiety with a restless, circular quality.",
      timeline: "Within 30 to 60 minutes for acute relief", safety: "generally-safe",
      contraindications: "Avoid with sedative medications. Not recommended during pregnancy.", storeMatch: false },
    { name: "Lemon Balm", latin: "Melissa officinalis", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Brew 1 to 2 teaspoons of dried lemon balm in hot water for 10 minutes. Drink up to 3 cups daily. The mild lemony flavor makes it a pleasant daily nervine tea.",
      timeline: "Within 30 to 45 minutes", safety: "generally-safe",
      contraindications: "May interact with thyroid medications and sedatives.", storeMatch: false },
  ],
  "Nervous Tension": [
    { name: "Skullcap", latin: "Scutellaria lateriflora", forms: ["Tincture", "Tea", "Capsule"],
      preparation: "Take 30 to 60 drops of skullcap tincture in water up to 3 times daily. For tea, steep 1 to 2 teaspoons of dried herb for 15 minutes. Skullcap is a classic nervine tonic for physical and emotional tension.",
      timeline: "Within 20 to 40 minutes", safety: "generally-safe",
      contraindications: "Source from reputable suppliers. High doses may cause confusion or drowsiness.", storeMatch: false },
    { name: "Chamomile", latin: "Matricaria chamomilla", forms: ["Tea", "Tincture", "Bath"],
      preparation: "Brew a soothing cup using 2 teaspoons of dried flowers steeped for 10 minutes. Drink throughout the day as needed. A chamomile bath in the evening helps release tension held in the body.",
      timeline: "Within 20 to 30 minutes", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy.", storeMatch: true },
    { name: "Kava", latin: "Piper methysticum", forms: ["Tea", "Capsule", "Tincture"],
      preparation: "Prepare traditional kava by kneading 2 to 4 tablespoons of ground root in cool water and straining. Alternatively, take 120 to 200mg of kavalactones via standardized extract. Effective for acute tension.",
      timeline: "Within 20 to 30 minutes", safety: "consult-practitioner",
      contraindications: "Potential liver toxicity with long-term or high-dose use. Avoid with alcohol, liver conditions, or liver-affecting medications. Banned or restricted in some countries.", storeMatch: false },
    { name: "Lavender", latin: "Lavandula angustifolia", forms: ["Essential Oil", "Tea", "Capsule"],
      preparation: "Inhale lavender essential oil directly or from a diffuser during tense moments. Silexan (oral lavender oil capsules at 80mg daily) has been clinically studied for anxiety relief.",
      timeline: "Inhalation: within 10 to 15 minutes. Capsules: 2 to 4 weeks of daily use.", safety: "generally-safe",
      contraindications: "", storeMatch: true },
  ],
  "Overwhelm": [
    { name: "Ashwagandha", latin: "Withania somnifera", forms: ["Capsule", "Powder", "Tincture"],
      preparation: "Take 300mg of standardized extract twice daily with meals. Ashwagandha helps modulate the stress response, making it easier to cope with periods of high demand.",
      timeline: "Noticeable resilience within 2 to 4 weeks", safety: "generally-safe",
      contraindications: "Avoid with thyroid medications unless supervised. Not for use during pregnancy.", storeMatch: false },
    { name: "Holy Basil", latin: "Ocimum tenuiflorum", forms: ["Tea", "Capsule", "Tincture"],
      preparation: "Drink 2 to 3 cups of tulsi tea daily during overwhelming periods. The adaptogenic properties help your body maintain equilibrium under sustained stress.",
      timeline: "Gentle calming effect within days; full adaptogenic support over weeks", safety: "generally-safe",
      contraindications: "May slow blood clotting. Discontinue 2 weeks before surgery.", storeMatch: false },
    { name: "Rhodiola", latin: "Rhodiola rosea", forms: ["Capsule", "Tincture"],
      preparation: "Take 200 to 400mg of standardized rhodiola extract (containing 3% rosavins) in the morning. This Arctic adaptogen supports mental stamina and helps prevent burnout during heavy workloads.",
      timeline: "Effects noticeable within 1 to 2 weeks", safety: "generally-safe",
      contraindications: "May cause restlessness if taken too late in the day. Avoid with bipolar disorder.", storeMatch: false },
  ],
  "Panic": [
    { name: "Kava", latin: "Piper methysticum", forms: ["Tincture", "Tea", "Capsule"],
      preparation: "For acute episodes, take 40 to 70 drops of kava tincture in water. The calming effect on the nervous system is fast-acting. Use only for short-term relief during intense moments.",
      timeline: "Within 15 to 20 minutes", safety: "consult-practitioner",
      contraindications: "Risk of liver damage with prolonged use. Avoid with alcohol, liver conditions, or liver-affecting medications.", storeMatch: false },
    { name: "Passionflower", latin: "Passiflora incarnata", forms: ["Tincture", "Tea", "Capsule"],
      preparation: "Take 40 to 60 drops of tincture in water at the first sign of panic. Passionflower increases GABA activity in the brain, helping to calm acute nervous system activation.",
      timeline: "Within 20 to 30 minutes", safety: "generally-safe",
      contraindications: "Avoid with sedative medications. Not for use during pregnancy.", storeMatch: false },
    { name: "Skullcap", latin: "Scutellaria lateriflora", forms: ["Tincture", "Tea"],
      preparation: "Take 30 to 60 drops of tincture in water as needed during acute episodes. Skullcap acts as a nervous system restorative, helping to quiet the fight-or-flight response.",
      timeline: "Within 15 to 30 minutes", safety: "generally-safe",
      contraindications: "High doses may cause drowsiness.", storeMatch: false },
  ],
  "Worry": [
    { name: "Lemon Balm", latin: "Melissa officinalis", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Brew 2 teaspoons of fresh or dried lemon balm in hot water for 10 minutes. Drink 3 cups daily. Research shows lemon balm reduces cortisol and promotes a sense of calm alertness.",
      timeline: "Within 30 to 45 minutes", safety: "generally-safe",
      contraindications: "May interact with thyroid medications.", storeMatch: false },
    { name: "Chamomile", latin: "Matricaria chamomilla", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Drink chamomile tea throughout the day, using 2 teaspoons of dried flowers per cup. Long-term daily use of chamomile extract (220 to 1100mg) has been studied for chronic worry.",
      timeline: "Acute calming within 30 minutes; sustained benefits with daily use over 4 to 8 weeks", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy.", storeMatch: true },
    { name: "Holy Basil", latin: "Ocimum tenuiflorum", forms: ["Tea", "Capsule"],
      preparation: "Brew tulsi tea using 1 to 2 teaspoons of dried leaves, steeped for 5 to 10 minutes. Drink 2 to 3 cups daily. Known in Ayurveda as an herb that clears mental fog and eases rumination.",
      timeline: "Gentle effects within days; stronger adaptogenic support over 2 to 4 weeks", safety: "generally-safe",
      contraindications: "May slow blood clotting.", storeMatch: false },
    { name: "Lavender", latin: "Lavandula angustifolia", forms: ["Essential Oil", "Tea", "Capsule"],
      preparation: "Diffuse lavender oil during the day or carry a personal inhaler. For internal use, try 80mg of standardized oral lavender oil capsules daily. The aroma alone activates calming pathways.",
      timeline: "Inhalation: within minutes. Capsules: 2 to 4 weeks.", safety: "generally-safe",
      contraindications: "", storeMatch: true },
  ],

  // ── Digestive Health ───────────────────────────────────────────────
  "Nausea": [
    { name: "Ginger", latin: "Zingiber officinale", forms: ["Tea", "Capsule", "Candied"],
      preparation: "Steep 1 inch of freshly sliced ginger in hot water for 10 minutes. Sip slowly. Ginger chews or capsules (250mg every 4 to 6 hours) are convenient when fresh root is unavailable.",
      timeline: "Within 15 to 30 minutes", safety: "generally-safe",
      contraindications: "Limit to 1 gram daily during pregnancy. May interact with blood thinners.", storeMatch: false },
    { name: "Peppermint", latin: "Mentha piperita", forms: ["Tea", "Essential Oil", "Capsule"],
      preparation: "Brew a strong peppermint tea and inhale the aroma before sipping. Enteric-coated peppermint oil capsules (0.2 to 0.4ml) bypass the stomach for intestinal benefit.",
      timeline: "Within 10 to 20 minutes", safety: "generally-safe",
      contraindications: "May worsen acid reflux in some people. Avoid peppermint oil with GERD.", storeMatch: true },
    { name: "Chamomile", latin: "Matricaria chamomilla", forms: ["Tea", "Tincture"],
      preparation: "Steep 2 teaspoons of dried chamomile flowers in hot water for 10 minutes. Sip warm in small amounts. The anti-spasmodic properties help calm stomach contractions that trigger nausea.",
      timeline: "Within 20 to 30 minutes", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy.", storeMatch: true },
    { name: "Fennel", latin: "Foeniculum vulgare", forms: ["Tea", "Tincture", "Seeds"],
      preparation: "Lightly crush 1 teaspoon of fennel seeds and steep in hot water for 10 minutes. Sip after meals. Chewing a few fennel seeds directly is a traditional quick remedy for queasiness.",
      timeline: "Within 15 to 30 minutes", safety: "generally-safe",
      contraindications: "Contains estrogen-like compounds. Avoid with estrogen-sensitive conditions.", storeMatch: false },
  ],
  "Bloating": [
    { name: "Fennel", latin: "Foeniculum vulgare", forms: ["Tea", "Seeds", "Tincture"],
      preparation: "Crush 1 teaspoon of fennel seeds and steep in hot water for 10 minutes. Drink after meals to ease gas and bloating. The volatile oils relax intestinal smooth muscle and reduce gas production.",
      timeline: "Within 15 to 30 minutes", safety: "generally-safe",
      contraindications: "Contains estrogen-like compounds. Use caution with estrogen-sensitive conditions.", storeMatch: false },
    { name: "Peppermint", latin: "Mentha piperita", forms: ["Tea", "Capsule", "Tincture"],
      preparation: "Brew peppermint tea after meals, or take enteric-coated peppermint oil capsules. The menthol relaxes the smooth muscles of the digestive tract, helping trapped gas pass.",
      timeline: "Within 15 to 30 minutes", safety: "generally-safe",
      contraindications: "May aggravate acid reflux. Avoid peppermint oil capsules with GERD.", storeMatch: true },
    { name: "Ginger", latin: "Zingiber officinale", forms: ["Tea", "Capsule", "Fresh"],
      preparation: "Grate half an inch of fresh ginger into hot water and steep for 10 minutes. Drink before or after meals. Ginger stimulates digestive enzyme production and promotes gastric motility.",
      timeline: "Within 20 to 30 minutes", safety: "generally-safe",
      contraindications: "May interact with blood thinners at high doses.", storeMatch: false },
    { name: "Dandelion", latin: "Taraxacum officinale", forms: ["Tea", "Tincture", "Fresh Greens"],
      preparation: "Steep 1 to 2 teaspoons of dried dandelion root or leaf in hot water for 10 minutes. Drink before meals to stimulate digestive juices and reduce water retention that contributes to a bloated feeling.",
      timeline: "Within 30 to 60 minutes", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy. May interact with diuretics or lithium.", storeMatch: false },
  ],
  "Indigestion": [
    { name: "Peppermint", latin: "Mentha piperita", forms: ["Tea", "Capsule", "Tincture"],
      preparation: "Sip peppermint tea slowly after a heavy meal. For chronic indigestion, enteric-coated capsules help the oil reach the intestines where it relaxes digestive muscles.",
      timeline: "Within 15 to 30 minutes", safety: "generally-safe",
      contraindications: "Avoid with GERD, as peppermint can relax the lower esophageal sphincter.", storeMatch: true },
    { name: "Ginger", latin: "Zingiber officinale", forms: ["Tea", "Capsule", "Fresh"],
      preparation: "Chew a small piece of fresh ginger before meals, or brew ginger tea with 1 inch of fresh root. Ginger accelerates gastric emptying and reduces discomfort after eating.",
      timeline: "Within 20 to 30 minutes", safety: "generally-safe",
      contraindications: "May interact with blood thinners.", storeMatch: false },
    { name: "Chamomile", latin: "Matricaria chamomilla", forms: ["Tea", "Tincture"],
      preparation: "Steep 2 teaspoons of dried chamomile flowers covered for 10 minutes. Drink between meals or after eating. The anti-inflammatory and antispasmodic properties soothe the entire digestive tract.",
      timeline: "Within 20 to 40 minutes", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy.", storeMatch: true },
    { name: "Gentian", latin: "Gentiana lutea", forms: ["Tincture", "Tea"],
      preparation: "Take 10 to 20 drops of gentian root tincture in a small amount of water 15 minutes before meals. The intensely bitter taste is part of the medicine, stimulating digestive secretions.",
      timeline: "Within 15 to 30 minutes when taken before eating", safety: "use-caution",
      contraindications: "Avoid with stomach or duodenal ulcers. Not recommended during pregnancy.", storeMatch: false },
  ],
  "Constipation": [
    { name: "Senna", latin: "Senna alexandrina", forms: ["Tea", "Capsule"],
      preparation: "Steep 1 to 2 teaspoons of dried senna leaves in hot water for 10 minutes. Drink before bed for a morning bowel movement. Use only for short-term relief, not as a daily remedy.",
      timeline: "6 to 12 hours (typically overnight)", safety: "use-caution",
      contraindications: "Do not use for more than 1 to 2 weeks. Long-term use can lead to dependency and electrolyte imbalance. Avoid during pregnancy.", storeMatch: false },
    { name: "Psyllium", latin: "Plantago ovata", forms: ["Powder", "Capsule"],
      preparation: "Mix 1 tablespoon of psyllium husk in a large glass of water and drink immediately before it thickens. Follow with another full glass of water. Take once or twice daily.",
      timeline: "12 to 72 hours for full effect with daily use", safety: "generally-safe",
      contraindications: "Always take with plenty of water to prevent choking or intestinal blockage. May reduce absorption of some medications.", storeMatch: false },
    { name: "Dandelion Root", latin: "Taraxacum officinale", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Simmer 1 to 2 teaspoons of dried dandelion root in water for 15 minutes. Drink 2 to 3 cups daily. The gentle bitter properties stimulate bile flow and support natural bowel regularity.",
      timeline: "1 to 3 days of regular use", safety: "generally-safe",
      contraindications: "Avoid with bile duct obstruction or Asteraceae allergy.", storeMatch: false },
  ],
  "Stomach Cramps": [
    { name: "Peppermint", latin: "Mentha piperita", forms: ["Tea", "Essential Oil", "Capsule"],
      preparation: "Brew a strong peppermint tea and sip slowly. For acute cramps, apply diluted peppermint oil to the abdomen in a clockwise circular motion. The antispasmodic action eases muscle contractions.",
      timeline: "Within 15 to 30 minutes", safety: "generally-safe",
      contraindications: "Avoid topical application near the face of infants and small children.", storeMatch: true },
    { name: "Chamomile", latin: "Matricaria chamomilla", forms: ["Tea", "Tincture", "Compress"],
      preparation: "Drink strong chamomile tea, or apply a warm chamomile compress to the abdomen. The flavonoids apigenin and bisabolol provide antispasmodic and anti-inflammatory relief to the gut.",
      timeline: "Within 20 to 30 minutes", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy.", storeMatch: true },
    { name: "Fennel", latin: "Foeniculum vulgare", forms: ["Tea", "Seeds", "Tincture"],
      preparation: "Crush and steep 1 teaspoon of fennel seeds in hot water for 10 minutes. The volatile oil anethole relaxes smooth muscle in the digestive tract, making fennel a traditional remedy for colic and cramping.",
      timeline: "Within 15 to 30 minutes", safety: "generally-safe",
      contraindications: "Use caution with estrogen-sensitive conditions.", storeMatch: false },
  ],

  // ── Skin Care ──────────────────────────────────────────────────────
  "Eczema": [
    { name: "Calendula", latin: "Calendula officinalis", forms: ["Salve", "Cream", "Compress"],
      preparation: "Apply calendula salve or cream to affected areas 2 to 3 times daily. For a soothing compress, steep 2 tablespoons of dried petals in hot water, cool, and apply with a cloth.",
      timeline: "Reduction in redness within 2 to 3 days; ongoing improvement over weeks", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy.", storeMatch: true },
    { name: "Chamomile", latin: "Matricaria chamomilla", forms: ["Cream", "Bath", "Compress"],
      preparation: "Add strong chamomile tea or 5 to 10 drops of chamomile essential oil to a lukewarm bath. Soak for 15 to 20 minutes. The anti-inflammatory compounds soothe itching and reduce flare-ups.",
      timeline: "Immediate soothing; cumulative healing over 1 to 2 weeks", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy. Patch-test essential oil before widespread use.", storeMatch: true },
    { name: "Licorice Root", latin: "Glycyrrhiza glabra", forms: ["Cream", "Compress", "Tea"],
      preparation: "Apply a cream containing licorice root extract (glycyrrhetinic acid) to affected patches twice daily. For a compress, brew strong licorice root tea, cool, and apply with gauze.",
      timeline: "Noticeable improvement within 1 to 2 weeks of daily application", safety: "use-caution",
      contraindications: "Internal use can raise blood pressure. Avoid internally with hypertension, heart, or kidney conditions. Topical use is generally safe.", storeMatch: false },
    { name: "Colloidal Oat", latin: "Avena sativa", forms: ["Bath", "Cream", "Compress"],
      preparation: "Add 1 cup of finely ground colloidal oatmeal to a lukewarm bath and soak for 15 to 20 minutes. Pat dry gently. The avenanthramides in oats calm inflammation and restore the skin barrier.",
      timeline: "Immediate itch relief; skin barrier improvement over 1 to 2 weeks", safety: "generally-safe",
      contraindications: "Verify gluten-free source if celiac or highly sensitive.", storeMatch: false },
  ],
  "Minor Burns": [
    { name: "Aloe Vera", latin: "Aloe vera", forms: ["Gel", "Fresh Leaf"],
      preparation: "Split a fresh aloe leaf and scoop out the clear gel. Apply generously to the burn and let it air dry. Reapply 3 to 4 times daily. Keep aloe gel refrigerated for extra cooling relief.",
      timeline: "Immediate cooling; promotes healing over 3 to 7 days", safety: "generally-safe",
      contraindications: "Rare allergic reactions may occur. Do not apply to deep or infected burns.", storeMatch: false },
    { name: "Lavender", latin: "Lavandula angustifolia", forms: ["Essential Oil", "Salve"],
      preparation: "Apply 1 to 2 drops of pure lavender essential oil directly to a minor burn (one of few oils safe for neat application on small areas). Alternatively, apply lavender salve 2 to 3 times daily.",
      timeline: "Immediate soothing; healing support over several days", safety: "generally-safe",
      contraindications: "For minor burns only. Seek medical attention for serious burns.", storeMatch: true },
    { name: "Calendula", latin: "Calendula officinalis", forms: ["Salve", "Cream", "Compress"],
      preparation: "Apply calendula salve to the burn after initial cooling. The triterpene compounds accelerate skin cell regeneration and reduce scarring. Reapply 2 to 3 times daily.",
      timeline: "Healing support over 5 to 10 days", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy.", storeMatch: true },
    { name: "Comfrey", latin: "Symphytum officinale", forms: ["Salve", "Compress"],
      preparation: "Apply comfrey salve to the burn once the initial heat has subsided. Allantoin in comfrey stimulates cell proliferation and tissue repair. Apply twice daily until healed.",
      timeline: "Accelerated healing over 5 to 10 days", safety: "use-caution",
      contraindications: "External use only. Do not apply to deep wounds as it can heal the surface before deeper tissue mends. Avoid on broken skin.", storeMatch: true },
  ],
  "Cuts and Wounds": [
    { name: "Calendula", latin: "Calendula officinalis", forms: ["Salve", "Tincture", "Compress"],
      preparation: "Clean the wound thoroughly, then apply calendula salve. For a wound wash, dilute calendula tincture (1:3 with clean water) and gently rinse the area before bandaging.",
      timeline: "Supports healing over 5 to 14 days depending on wound depth", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy.", storeMatch: true },
    { name: "Yarrow", latin: "Achillea millefolium", forms: ["Poultice", "Tincture", "Salve"],
      preparation: "For acute bleeding, apply crushed fresh yarrow leaves directly as a poultice. Yarrow is a traditional battlefield herb known for its styptic (blood-stopping) action. For healing, apply yarrow salve daily.",
      timeline: "Bleeding slows within minutes; wound healing over 1 to 2 weeks", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy. Do not use during pregnancy.", storeMatch: false },
    { name: "Comfrey", latin: "Symphytum officinale", forms: ["Salve", "Poultice"],
      preparation: "Apply comfrey salve to clean, shallow cuts to accelerate tissue repair. The allantoin content stimulates rapid cell growth. Do not use on deep puncture wounds.",
      timeline: "Accelerated healing visible within 3 to 7 days", safety: "use-caution",
      contraindications: "External use only. Do not apply to deep wounds; it may close the surface prematurely, trapping bacteria.", storeMatch: true },
    { name: "Tea Tree", latin: "Melaleuca alternifolia", forms: ["Essential Oil", "Salve"],
      preparation: "Dilute 2 to 3 drops of tea tree essential oil in 1 teaspoon of carrier oil and apply to cleaned wounds. Its broad-spectrum antimicrobial action helps prevent infection in minor cuts and scrapes.",
      timeline: "Antiseptic action is immediate; healing support over 5 to 10 days", safety: "generally-safe",
      contraindications: "Never ingest tea tree oil. May cause contact dermatitis in sensitive individuals. Always dilute before application.", storeMatch: true },
  ],
  "Dry Skin": [
    { name: "Calendula", latin: "Calendula officinalis", forms: ["Salve", "Cream", "Oil"],
      preparation: "Apply calendula-infused oil or salve to dry patches after bathing. Calendula supports the skin's lipid barrier and promotes gentle hydration. Use daily as a body moisturizer.",
      timeline: "Noticeable softening within 2 to 3 days of daily use", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy.", storeMatch: true },
    { name: "Comfrey", latin: "Symphytum officinale", forms: ["Salve", "Cream"],
      preparation: "Massage comfrey salve into dry, rough areas of skin. The mucilage and allantoin content deeply moisturize and support cell turnover. Apply twice daily to hands, elbows, and heels.",
      timeline: "Improvement within 3 to 5 days of regular use", safety: "generally-safe",
      contraindications: "External use only. Safe for intact skin.", storeMatch: true },
    { name: "Chamomile", latin: "Matricaria chamomilla", forms: ["Cream", "Bath", "Oil"],
      preparation: "Add chamomile-infused oil to your bath or apply chamomile cream after showering. The anti-inflammatory and emollient properties calm irritated, flaky skin and restore moisture.",
      timeline: "Immediate soothing; ongoing improvement with daily use", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy.", storeMatch: true },
  ],
  "Rashes": [
    { name: "Calendula", latin: "Calendula officinalis", forms: ["Salve", "Cream", "Compress"],
      preparation: "Apply calendula salve to the rash 3 times daily. For widespread rashes, make a strong calendula tea, cool it, and apply as a compress for 15 minutes.",
      timeline: "Redness reduction within 1 to 3 days", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy.", storeMatch: true },
    { name: "Chamomile", latin: "Matricaria chamomilla", forms: ["Cream", "Bath", "Compress"],
      preparation: "Add 5 to 8 drops of chamomile essential oil to a cool bath and soak for 15 minutes. Apply chamomile cream to affected areas after drying. Helps calm the histamine response in skin tissue.",
      timeline: "Immediate itch relief; healing over 3 to 7 days", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy.", storeMatch: true },
    { name: "Plantain", latin: "Plantago major", forms: ["Poultice", "Salve", "Compress"],
      preparation: "Crush fresh plantain leaves (the common garden weed, not the banana relative) and apply directly to the rash as a poultice. For a salve, infuse dried plantain in oil and apply 2 to 3 times daily.",
      timeline: "Itch relief within minutes; healing over 3 to 7 days", safety: "generally-safe",
      contraindications: "", storeMatch: false },
  ],
  "Acne": [
    { name: "Tea Tree", latin: "Melaleuca alternifolia", forms: ["Essential Oil", "Gel"],
      preparation: "Dilute tea tree oil (5% concentration) in a carrier oil or aloe vera gel. Apply to blemishes with a cotton swab. Clinical studies show tea tree oil is comparable to benzoyl peroxide with fewer side effects.",
      timeline: "Noticeable improvement within 4 to 8 weeks of consistent use", safety: "generally-safe",
      contraindications: "Never apply undiluted. May cause dryness or irritation in sensitive skin. Patch-test first.", storeMatch: true },
    { name: "Witch Hazel", latin: "Hamamelis virginiana", forms: ["Toner", "Compress"],
      preparation: "Apply alcohol-free witch hazel extract to the face with a cotton pad as a toner after cleansing. Its astringent tannins reduce excess oil and tighten pores without over-drying.",
      timeline: "Reduced oiliness within 1 to 2 weeks; clearer skin over 4 to 6 weeks", safety: "generally-safe",
      contraindications: "Choose alcohol-free preparations to avoid drying the skin further.", storeMatch: false },
    { name: "Calendula", latin: "Calendula officinalis", forms: ["Wash", "Cream", "Tincture"],
      preparation: "Use a gentle calendula face wash or apply diluted calendula tincture to blemishes. The anti-inflammatory and antimicrobial properties help reduce redness and prevent bacterial buildup.",
      timeline: "Gradual improvement over 2 to 4 weeks", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy.", storeMatch: true },
    { name: "Green Tea", latin: "Camellia sinensis", forms: ["Toner", "Compress", "Cream"],
      preparation: "Brew strong green tea, cool it, and apply as a facial toner or compress. The polyphenol EGCG reduces sebum production and inflammation. Use daily after cleansing.",
      timeline: "Visible improvement over 4 to 6 weeks of daily use", safety: "generally-safe",
      contraindications: "", storeMatch: false },
  ],

  // ── Respiratory ────────────────────────────────────────────────────
  "Cough": [
    { name: "Thyme", latin: "Thymus vulgaris", forms: ["Tea", "Syrup", "Tincture"],
      preparation: "Steep 1 to 2 teaspoons of fresh or dried thyme in hot water for 10 minutes. Add honey for soothing effect. Thyme is approved in Germany as a standard treatment for bronchitis and upper respiratory coughs.",
      timeline: "Within 30 to 60 minutes; full effect over 3 to 5 days", safety: "generally-safe",
      contraindications: "Avoid thyme essential oil internally. Culinary and tea use are safe.", storeMatch: false },
    { name: "Marshmallow Root", latin: "Althaea officinalis", forms: ["Tea", "Syrup", "Lozenge"],
      preparation: "Cold-infuse 1 tablespoon of dried marshmallow root in a cup of room-temperature water for 4 to 8 hours, then strain. The mucilage coats and soothes irritated throat and bronchial tissue.",
      timeline: "Immediate soothing; sustained relief with regular use", safety: "generally-safe",
      contraindications: "May slow absorption of other medications. Take 1 hour apart from other drugs.", storeMatch: false },
    { name: "Mullein", latin: "Verbascum thapsus", forms: ["Tea", "Tincture", "Syrup"],
      preparation: "Steep 1 to 2 teaspoons of dried mullein leaves in hot water for 10 to 15 minutes. Strain through a fine cloth to remove tiny hairs. A traditional lung tonic that helps expel mucus.",
      timeline: "Soothing within 30 minutes; bronchial clearing over 3 to 5 days", safety: "generally-safe",
      contraindications: "Always strain mullein tea through fine cloth or a coffee filter.", storeMatch: false },
    { name: "Licorice Root", latin: "Glycyrrhiza glabra", forms: ["Tea", "Lozenge", "Syrup"],
      preparation: "Simmer 1 teaspoon of dried licorice root in water for 10 minutes. The glycyrrhizin acts as an expectorant and demulcent, loosening phlegm while soothing inflamed airways.",
      timeline: "Within 30 to 60 minutes", safety: "use-caution",
      contraindications: "Avoid with high blood pressure, heart conditions, or kidney disease. Do not use for more than 4 to 6 weeks continuously.", storeMatch: false },
  ],
  "Congestion": [
    { name: "Eucalyptus", latin: "Eucalyptus globulus", forms: ["Essential Oil", "Steam Inhalation", "Salve"],
      preparation: "Add 3 to 5 drops of eucalyptus essential oil to a bowl of steaming water. Drape a towel over your head and inhale deeply for 5 to 10 minutes. Apply eucalyptus chest salve before bed.",
      timeline: "Immediate opening of airways", safety: "generally-safe",
      contraindications: "Do not ingest eucalyptus oil. Keep away from the faces of infants and small children. Not safe for children under 3.", storeMatch: true },
    { name: "Peppermint", latin: "Mentha piperita", forms: ["Essential Oil", "Tea", "Steam Inhalation"],
      preparation: "Inhale peppermint steam or drink hot peppermint tea. The menthol creates a cooling sensation that helps open nasal passages. Apply diluted oil to the chest and under the nose.",
      timeline: "Within 5 to 15 minutes", safety: "generally-safe",
      contraindications: "Avoid applying near the face of infants and young children.", storeMatch: true },
    { name: "Elderberry", latin: "Sambucus nigra", forms: ["Syrup", "Tea", "Tincture"],
      preparation: "Take 1 tablespoon of elderberry syrup 3 to 4 times daily during congestion. The flavonoids and anthocyanins support immune response and help reduce the duration of upper respiratory symptoms.",
      timeline: "Immune support within 24 to 48 hours; congestion relief over 2 to 3 days", safety: "generally-safe",
      contraindications: "Use only commercially prepared elderberry products. Raw or unripe elderberries contain cyanogenic glycosides and are toxic.", storeMatch: false },
    { name: "Thyme", latin: "Thymus vulgaris", forms: ["Tea", "Steam Inhalation", "Syrup"],
      preparation: "Add fresh or dried thyme to a steam inhalation or brew a strong thyme tea. The thymol and carvacrol compounds are natural decongestants with antimicrobial properties.",
      timeline: "Within 20 to 30 minutes", safety: "generally-safe",
      contraindications: "Safe in culinary and tea amounts.", storeMatch: false },
  ],
  "Sore Throat": [
    { name: "Slippery Elm", latin: "Ulmus rubra", forms: ["Lozenge", "Tea", "Powder"],
      preparation: "Mix 1 to 2 teaspoons of slippery elm powder in warm water to make a soothing gel. Sip slowly, letting it coat the throat. The mucilage forms a protective film over inflamed tissue.",
      timeline: "Immediate coating and soothing", safety: "generally-safe",
      contraindications: "May slow absorption of other medications. Take 1 hour apart from other drugs.", storeMatch: false },
    { name: "Marshmallow Root", latin: "Althaea officinalis", forms: ["Tea", "Syrup", "Lozenge"],
      preparation: "Cold-infuse 1 tablespoon of marshmallow root in cool water for 4 to 8 hours. Sip throughout the day. The thick mucilage provides a soothing coat to raw, irritated throat tissue.",
      timeline: "Immediate soothing effect", safety: "generally-safe",
      contraindications: "May slow absorption of medications taken at the same time.", storeMatch: false },
    { name: "Sage", latin: "Salvia officinalis", forms: ["Gargle", "Tea", "Spray"],
      preparation: "Brew a strong sage tea (2 teaspoons per cup, steeped for 15 minutes) and use as a gargle every 2 to 3 hours. Clinical trials have shown sage gargle effective for sore throat relief.",
      timeline: "Within 15 to 30 minutes after gargling", safety: "generally-safe",
      contraindications: "Avoid large internal doses during pregnancy. Gargling and spitting is safe.", storeMatch: false },
    { name: "Licorice Root", latin: "Glycyrrhiza glabra", forms: ["Tea", "Gargle", "Lozenge"],
      preparation: "Simmer 1 teaspoon of dried licorice root for 10 minutes. Use as a gargle or drink as tea. The demulcent and anti-inflammatory properties make it one of the most effective throat soothers.",
      timeline: "Within 15 to 30 minutes", safety: "use-caution",
      contraindications: "Avoid with hypertension, heart conditions, or kidney problems. Short-term gargle use is generally safe.", storeMatch: false },
  ],
  "Seasonal Allergies": [
    { name: "Nettle", latin: "Urtica dioica", forms: ["Tea", "Capsule", "Tincture"],
      preparation: "Drink 2 to 3 cups of nettle tea daily starting 2 to 4 weeks before allergy season. Freeze-dried nettle capsules (300mg, 2 to 3 times daily) are particularly effective for histamine response.",
      timeline: "Preventive: best started weeks before season. Acute: partial relief within hours to days.", safety: "generally-safe",
      contraindications: "May lower blood sugar. Use caution with diabetes medications.", storeMatch: false },
    { name: "Elderflower", latin: "Sambucus nigra", forms: ["Tea", "Tincture", "Syrup"],
      preparation: "Steep 2 teaspoons of dried elderflowers in hot water for 10 minutes. Drink 3 cups daily during allergy season. Elderflower is a traditional remedy for hay fever and sinus inflammation.",
      timeline: "Relief builds over 1 to 2 weeks of daily use", safety: "generally-safe",
      contraindications: "Use only dried or cooked elderflower. Raw plant parts may cause gastrointestinal upset.", storeMatch: false },
    { name: "Eyebright", latin: "Euphrasia officinalis", forms: ["Tea", "Tincture", "Compress"],
      preparation: "Brew 1 teaspoon of dried eyebright in hot water for 10 minutes. Drink 2 to 3 cups daily, or use cooled tea as an eye compress for itchy, watery eyes during peak allergy symptoms.",
      timeline: "Within 30 to 60 minutes for eye compress; 1 to 2 weeks for systemic tea use", safety: "generally-safe",
      contraindications: "Ensure sterile preparation if using as an eye wash.", storeMatch: false },
  ],
  "Sinus Pressure": [
    { name: "Eucalyptus", latin: "Eucalyptus globulus", forms: ["Essential Oil", "Steam Inhalation"],
      preparation: "Add 4 to 6 drops of eucalyptus oil to a bowl of steaming water and inhale under a towel for 10 minutes. The 1,8-cineole compound is a powerful decongestant that opens sinus passages.",
      timeline: "Within 5 to 15 minutes", safety: "generally-safe",
      contraindications: "For inhalation only, do not ingest. Keep away from small children.", storeMatch: true },
    { name: "Peppermint", latin: "Mentha piperita", forms: ["Essential Oil", "Tea", "Steam Inhalation"],
      preparation: "Apply diluted peppermint oil to the bridge of the nose and temples. Breathe in peppermint steam or drink hot peppermint tea. Menthol activates cold receptors and relieves the sensation of pressure.",
      timeline: "Within 5 to 15 minutes", safety: "generally-safe",
      contraindications: "Avoid near the face of infants and young children.", storeMatch: true },
    { name: "Goldenseal", latin: "Hydrastis canadensis", forms: ["Capsule", "Tincture", "Nasal Rinse"],
      preparation: "Take 500mg of goldenseal root capsules twice daily, or add a few drops of tincture to a saline nasal rinse. The berberine content has antimicrobial properties that help with sinus infections.",
      timeline: "1 to 3 days for antimicrobial benefit; immediate relief with nasal rinse", safety: "use-caution",
      contraindications: "Avoid during pregnancy. Do not use for more than 3 weeks continuously. May interact with many medications.", storeMatch: false },
  ],

  // ── Energy and Focus ───────────────────────────────────────────────
  "Fatigue": [
    { name: "Ginseng", latin: "Panax ginseng", forms: ["Capsule", "Tea", "Tincture"],
      preparation: "Take 200 to 400mg of standardized Panax ginseng extract daily in the morning. For tea, simmer 1 to 2 grams of sliced root for 15 minutes. A cornerstone adaptogen for sustained energy.",
      timeline: "Initial lift within hours; full adaptogenic benefit over 4 to 8 weeks", safety: "generally-safe",
      contraindications: "May cause insomnia if taken too late. Avoid with blood thinners. Use caution with high blood pressure.", storeMatch: false },
    { name: "Rhodiola", latin: "Rhodiola rosea", forms: ["Capsule", "Tincture"],
      preparation: "Take 200 to 400mg of standardized extract (3% rosavins, 1% salidroside) in the morning on an empty stomach. Rhodiola fights fatigue at the cellular level by supporting mitochondrial function.",
      timeline: "Noticeable energy improvement within 1 to 2 weeks", safety: "generally-safe",
      contraindications: "May cause restlessness or insomnia. Take early in the day. Avoid with bipolar disorder.", storeMatch: false },
    { name: "Maca", latin: "Lepidium meyenii", forms: ["Powder", "Capsule"],
      preparation: "Add 1 to 2 teaspoons of maca powder to smoothies, oatmeal, or warm drinks. Start with a smaller dose and increase gradually. Maca is a nutritive root used for centuries in the Andes for stamina.",
      timeline: "Gradual energy improvement over 2 to 4 weeks", safety: "generally-safe",
      contraindications: "May affect hormone levels. Use caution with hormone-sensitive conditions.", storeMatch: false },
    { name: "Ashwagandha", latin: "Withania somnifera", forms: ["Capsule", "Powder", "Tincture"],
      preparation: "Take 300 to 600mg of standardized root extract daily. Unlike stimulants, ashwagandha restores energy by reducing cortisol and supporting thyroid function. Take with meals.",
      timeline: "2 to 4 weeks of daily use for sustained energy", safety: "generally-safe",
      contraindications: "Avoid with thyroid medication unless supervised. Not for use during pregnancy.", storeMatch: false },
  ],
  "Brain Fog": [
    { name: "Rosemary", latin: "Rosmarinus officinalis", forms: ["Essential Oil", "Tea", "Tincture"],
      preparation: "Inhale rosemary essential oil while working, or brew 1 teaspoon of dried rosemary in hot water for 10 minutes. Studies show that rosemary aroma improves memory performance and alertness.",
      timeline: "Cognitive clarity within 15 to 30 minutes of inhalation", safety: "generally-safe",
      contraindications: "Avoid large medicinal doses during pregnancy. Culinary and tea use are safe.", storeMatch: false },
    { name: "Ginkgo", latin: "Ginkgo biloba", forms: ["Capsule", "Tincture", "Tea"],
      preparation: "Take 120 to 240mg of standardized ginkgo extract (24% flavone glycosides) daily in divided doses. Ginkgo improves cerebral blood flow and has been studied extensively for cognitive support.",
      timeline: "4 to 6 weeks of daily use for full cognitive benefits", safety: "use-caution",
      contraindications: "May interact with blood thinners and increase bleeding risk. Avoid 2 weeks before surgery.", storeMatch: false },
    { name: "Gotu Kola", latin: "Centella asiatica", forms: ["Tea", "Capsule", "Tincture"],
      preparation: "Take 500mg of dried gotu kola extract twice daily, or brew 1 to 2 teaspoons of dried herb in hot water. A traditional brain tonic in Ayurvedic and Chinese medicine for mental clarity.",
      timeline: "2 to 4 weeks of daily use", safety: "generally-safe",
      contraindications: "May cause liver toxicity in rare cases with prolonged high-dose use. Avoid with liver conditions.", storeMatch: false },
    { name: "Lion's Mane", latin: "Hericium erinaceus", forms: ["Capsule", "Powder", "Tincture"],
      preparation: "Take 500 to 1000mg of lion's mane extract daily, or add powder to coffee or tea. This medicinal mushroom stimulates nerve growth factor (NGF) production, supporting brain plasticity and focus.",
      timeline: "Cognitive improvements noticeable over 4 to 8 weeks", safety: "generally-safe",
      contraindications: "Avoid with mushroom allergies. May interact with blood-thinning medications.", storeMatch: false },
  ],
  "Low Motivation": [
    { name: "Rhodiola", latin: "Rhodiola rosea", forms: ["Capsule", "Tincture"],
      preparation: "Take 200 to 400mg of standardized extract in the morning. Rhodiola is clinically studied for reducing mental fatigue and improving motivation under stress conditions.",
      timeline: "1 to 2 weeks of daily use", safety: "generally-safe",
      contraindications: "May cause restlessness. Take in the morning only. Avoid with bipolar disorder.", storeMatch: false },
    { name: "Ginseng", latin: "Panax ginseng", forms: ["Capsule", "Tea", "Tincture"],
      preparation: "Take 200mg of standardized extract in the morning. Ginseng enhances dopamine activity, which supports motivation and drive. Combine with physical activity for best results.",
      timeline: "Energy and motivation building over 2 to 4 weeks", safety: "generally-safe",
      contraindications: "May cause insomnia if taken late. Use caution with blood thinners and blood pressure medications.", storeMatch: false },
    { name: "Maca", latin: "Lepidium meyenii", forms: ["Powder", "Capsule"],
      preparation: "Add 1 to 2 teaspoons of maca powder to morning smoothies or warm drinks. Maca provides sustained, non-jittery energy and has traditionally been used for endurance and vitality.",
      timeline: "Gradual improvement over 2 to 3 weeks", safety: "generally-safe",
      contraindications: "Use caution with hormone-sensitive conditions.", storeMatch: false },
  ],
  "Afternoon Slump": [
    { name: "Peppermint", latin: "Mentha piperita", forms: ["Tea", "Essential Oil"],
      preparation: "Brew a strong cup of peppermint tea or inhale peppermint oil mid-afternoon. Research shows peppermint aroma enhances alertness and reduces fatigue without disrupting nighttime sleep.",
      timeline: "Within 5 to 15 minutes", safety: "generally-safe",
      contraindications: "", storeMatch: true },
    { name: "Green Tea", latin: "Camellia sinensis", forms: ["Tea"],
      preparation: "Brew green tea at 175F (80C) for 2 to 3 minutes for optimal flavor and L-theanine extraction. The combination of moderate caffeine and L-theanine provides calm, focused alertness.",
      timeline: "Within 15 to 30 minutes", safety: "generally-safe",
      contraindications: "Contains caffeine. Limit intake if sensitive to caffeine or in the late afternoon.", storeMatch: false },
    { name: "Rosemary", latin: "Rosmarinus officinalis", forms: ["Essential Oil", "Tea"],
      preparation: "Inhale rosemary essential oil from the bottle or a personal inhaler when energy dips. Alternatively, brew rosemary tea for a warming, stimulating afternoon drink.",
      timeline: "Within 10 to 20 minutes", safety: "generally-safe",
      contraindications: "Avoid large medicinal doses during pregnancy.", storeMatch: false },
    { name: "Ginseng", latin: "Panax ginseng", forms: ["Tea", "Capsule"],
      preparation: "Sip ginseng tea in the early afternoon. Choose American ginseng (Panax quinquefolius) for a gentler lift if Asian ginseng feels too stimulating.",
      timeline: "Within 30 to 60 minutes", safety: "generally-safe",
      contraindications: "May interfere with sleep if taken too late. Use caution with blood thinners.", storeMatch: false },
  ],

  // ── Immune Support ─────────────────────────────────────────────────
  "Cold and Flu Onset": [
    { name: "Echinacea", latin: "Echinacea purpurea", forms: ["Tincture", "Tea", "Capsule"],
      preparation: "At the first sign of illness, take 2 to 3ml of echinacea tincture every 2 to 3 hours for the first 24 to 48 hours, then reduce to 3 times daily. Early intervention is key for echinacea's effectiveness.",
      timeline: "May reduce cold duration by 1 to 2 days when started early", safety: "generally-safe",
      contraindications: "Avoid with autoimmune conditions. Asteraceae allergy may cause reactions.", storeMatch: false },
    { name: "Elderberry", latin: "Sambucus nigra", forms: ["Syrup", "Tea", "Tincture"],
      preparation: "Take 1 tablespoon of elderberry syrup 4 times daily at the first sign of cold or flu. Studies show elderberry can reduce flu duration by an average of 4 days when taken within 48 hours of onset.",
      timeline: "Symptom reduction within 2 to 3 days", safety: "generally-safe",
      contraindications: "Use only prepared products. Raw elderberries are toxic. May overstimulate the immune system in autoimmune conditions.", storeMatch: false },
    { name: "Andrographis", latin: "Andrographis paniculata", forms: ["Capsule", "Tincture"],
      preparation: "Take 400mg of standardized andrographis extract 3 times daily at the onset of symptoms. Known as 'Indian echinacea,' it is widely used in Scandinavian and Ayurvedic traditions for upper respiratory infections.",
      timeline: "Symptom improvement within 2 to 5 days", safety: "generally-safe",
      contraindications: "Avoid during pregnancy. May interact with blood pressure and blood-thinning medications.", storeMatch: false },
    { name: "Garlic", latin: "Allium sativum", forms: ["Fresh", "Capsule", "Syrup"],
      preparation: "Crush 1 to 2 cloves of fresh garlic and let sit for 10 minutes before consuming (this activates allicin). Add to honey and take by the spoonful, or stir into warm broth. Fresh is always most potent.",
      timeline: "Immune support within 24 to 48 hours of consistent use", safety: "generally-safe",
      contraindications: "May interact with blood thinners. Raw garlic can irritate the stomach on an empty stomach.", storeMatch: false },
  ],
  "Frequent Illness": [
    { name: "Astragalus", latin: "Astragalus membranaceus", forms: ["Capsule", "Tea", "Tincture"],
      preparation: "Take 500 to 1000mg of astragalus root extract daily, or simmer dried root slices in soups and broths. A premier tonic herb in Chinese medicine for building deep immune resilience over time.",
      timeline: "Immune strengthening over 4 to 8 weeks of daily use", safety: "generally-safe",
      contraindications: "Avoid during acute infections (it is a tonic, not an acute remedy). May interact with immunosuppressive drugs.", storeMatch: false },
    { name: "Reishi", latin: "Ganoderma lucidum", forms: ["Capsule", "Tea", "Tincture"],
      preparation: "Take 1 to 3 grams of reishi extract daily, or simmer dried slices for 30 minutes to make a bitter tea. Reishi modulates the immune system, making it appropriate for both under- and overactive immunity.",
      timeline: "Immune balancing over 4 to 12 weeks", safety: "generally-safe",
      contraindications: "May interact with blood thinners and immunosuppressive drugs. Avoid 2 weeks before surgery.", storeMatch: false },
    { name: "Echinacea", latin: "Echinacea purpurea", forms: ["Tincture", "Tea", "Capsule"],
      preparation: "Take echinacea in 2-week on, 1-week off cycles during cold and flu season. Use 2 to 3ml of tincture daily during the 'on' weeks to prime the immune system for pathogen encounters.",
      timeline: "Preventive benefits build over several weeks of cycling", safety: "generally-safe",
      contraindications: "Avoid with autoimmune conditions. Long continuous use may reduce effectiveness.", storeMatch: false },
    { name: "Elderberry", latin: "Sambucus nigra", forms: ["Syrup", "Tea", "Capsule"],
      preparation: "Take 1 tablespoon of elderberry syrup daily as a preventive during cold and flu season. The anthocyanins and vitamins A, B, and C support baseline immune readiness.",
      timeline: "Ongoing preventive support with daily use", safety: "generally-safe",
      contraindications: "Use only prepared products. Raw elderberries contain toxic compounds.", storeMatch: false },
  ],
  "Post-Illness Recovery": [
    { name: "Astragalus", latin: "Astragalus membranaceus", forms: ["Tea", "Capsule", "Broth"],
      preparation: "Simmer dried astragalus root slices in bone broth or soup for deep nourishment. Take 500 to 1000mg of extract daily. Astragalus rebuilds the body's reserves after illness depletes them.",
      timeline: "Recovery support over 2 to 6 weeks", safety: "generally-safe",
      contraindications: "Begin only after the acute phase of illness has passed.", storeMatch: false },
    { name: "Ashwagandha", latin: "Withania somnifera", forms: ["Capsule", "Powder", "Tincture"],
      preparation: "Take 300 to 600mg daily with warm milk during recovery. Ashwagandha helps restore energy, reduce lingering fatigue, and rebuild the stress resilience that illness depletes.",
      timeline: "2 to 4 weeks of daily use", safety: "generally-safe",
      contraindications: "Avoid with thyroid medication unless supervised. Not for use during pregnancy.", storeMatch: false },
    { name: "Reishi", latin: "Ganoderma lucidum", forms: ["Capsule", "Tea", "Tincture"],
      preparation: "Take 1 to 3 grams of reishi extract daily during recovery. This immune-modulating mushroom supports the body in returning to homeostasis after the disruption of illness.",
      timeline: "Ongoing support over 4 to 8 weeks", safety: "generally-safe",
      contraindications: "May interact with blood thinners and immunosuppressants.", storeMatch: false },
    { name: "Ginseng", latin: "Panax ginseng", forms: ["Tea", "Capsule", "Tincture"],
      preparation: "Sip ginseng tea or take 200mg of extract daily once fever has fully resolved. Ginseng restores vitality and has been studied for reducing post-illness fatigue.",
      timeline: "Energy restoration over 2 to 4 weeks", safety: "generally-safe",
      contraindications: "Avoid during acute illness with fever. Use caution with blood thinners.", storeMatch: false },
  ],

  // ── Emotional Balance ──────────────────────────────────────────────
  "Grief": [
    { name: "St. John's Wort", latin: "Hypericum perforatum", forms: ["Tea", "Capsule", "Tincture"],
      preparation: "Take 300mg of standardized extract (0.3% hypericin) three times daily. For tea, steep 1 to 2 teaspoons in hot water for 10 minutes. A well-studied herb for mild to moderate emotional distress.",
      timeline: "Full effects develop over 4 to 6 weeks of consistent daily use", safety: "consult-practitioner",
      contraindications: "Interacts with many medications including antidepressants, birth control, blood thinners, and HIV drugs. Causes photosensitivity. Always consult a practitioner before use.", storeMatch: false },
    { name: "Rose", latin: "Rosa damascena", forms: ["Tea", "Essential Oil", "Tincture"],
      preparation: "Brew rose petal tea with 1 to 2 teaspoons of dried petals per cup. Inhale rose essential oil or add to a bath. Rose has a heart-opening quality in traditional herbalism, gently supporting the grieving process.",
      timeline: "Gentle emotional support from the first use; deepens over weeks", safety: "generally-safe",
      contraindications: "", storeMatch: false },
    { name: "Hawthorn", latin: "Crataegus monogyna", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Take 30 to 60 drops of hawthorn berry tincture 2 to 3 times daily, or brew 1 teaspoon of dried berries as tea. In herbal traditions, hawthorn is the herb of the heart, supporting both physical and emotional healing.",
      timeline: "Emotional support builds gently over 2 to 4 weeks", safety: "use-caution",
      contraindications: "May interact with heart medications (beta-blockers, digoxin). Consult a practitioner if on heart drugs.", storeMatch: false },
    { name: "Lemon Balm", latin: "Melissa officinalis", forms: ["Tea", "Tincture", "Bath"],
      preparation: "Drink 2 to 3 cups of lemon balm tea daily. The gentle uplifting quality helps ease the heaviness of grief without numbing emotions. Add to evening baths for deep relaxation.",
      timeline: "Gentle mood support within days of daily use", safety: "generally-safe",
      contraindications: "May interact with thyroid medications.", storeMatch: false },
  ],
  "Sadness": [
    { name: "St. John's Wort", latin: "Hypericum perforatum", forms: ["Capsule", "Tea", "Tincture"],
      preparation: "Take 300mg of standardized extract three times daily with meals. Consistency is essential, as this herb requires sustained use to reach therapeutic levels. Do not combine with pharmaceutical antidepressants.",
      timeline: "4 to 6 weeks for full mood-lifting effects", safety: "consult-practitioner",
      contraindications: "Interacts with many medications including SSRIs, birth control, blood thinners, and organ transplant drugs. Causes sun sensitivity.", storeMatch: false },
    { name: "Saffron", latin: "Crocus sativus", forms: ["Capsule", "Tea"],
      preparation: "Take 30mg of standardized saffron extract daily, or steep a generous pinch of saffron threads in hot water for 10 minutes. Clinical trials show saffron comparable to some antidepressants for mild sadness.",
      timeline: "2 to 4 weeks of daily use", safety: "generally-safe",
      contraindications: "Avoid high doses during pregnancy. Expensive, so quality sourcing matters.", storeMatch: false },
    { name: "Lemon Balm", latin: "Melissa officinalis", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Brew 2 to 3 cups of lemon balm tea daily. The rosmarinic acid modulates GABA receptors, gently lifting mood while calming anxiety. A lovely herb for days that feel heavy.",
      timeline: "Gentle brightening within days of daily use", safety: "generally-safe",
      contraindications: "May interact with thyroid medications.", storeMatch: false },
    { name: "Rose", latin: "Rosa damascena", forms: ["Tea", "Essential Oil", "Tincture"],
      preparation: "Drink rose petal tea in the morning or diffuse rose essential oil. Rose is traditionally used to open and comfort the heart. Even the act of preparing it can be a gentle ritual of self-care.",
      timeline: "Subtle emotional warmth from the first cup", safety: "generally-safe",
      contraindications: "", storeMatch: false },
  ],
  "Irritability": [
    { name: "Chamomile", latin: "Matricaria chamomilla", forms: ["Tea", "Tincture", "Bath"],
      preparation: "Drink 2 to 3 cups of chamomile tea daily, or take 30 to 60 drops of tincture as needed. The gentle sedative quality takes the edge off irritability without causing drowsiness at low doses.",
      timeline: "Within 20 to 30 minutes", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy.", storeMatch: true },
    { name: "Passionflower", latin: "Passiflora incarnata", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Take 30 to 60 drops of passionflower tincture in water when irritability flares. For daily support, drink 1 to 2 cups of passionflower tea. Calms the nervous system without heavy sedation.",
      timeline: "Within 20 to 40 minutes", safety: "generally-safe",
      contraindications: "Avoid with sedative medications. Not recommended during pregnancy.", storeMatch: false },
    { name: "Lemon Balm", latin: "Melissa officinalis", forms: ["Tea", "Tincture"],
      preparation: "Brew fresh or dried lemon balm tea and sip throughout the day. The pleasant flavor and calming effect help smooth out the rough edges of a frustrating day.",
      timeline: "Within 30 to 45 minutes", safety: "generally-safe",
      contraindications: "May interact with thyroid medications.", storeMatch: false },
    { name: "Skullcap", latin: "Scutellaria lateriflora", forms: ["Tincture", "Tea"],
      preparation: "Take 30 drops of tincture in water up to 3 times daily. Skullcap excels at calming nervous irritability, the kind that makes you snap at small annoyances.",
      timeline: "Within 20 to 30 minutes", safety: "generally-safe",
      contraindications: "Source from reputable suppliers.", storeMatch: false },
  ],
  "Mood Swings": [
    { name: "St. John's Wort", latin: "Hypericum perforatum", forms: ["Capsule", "Tea", "Tincture"],
      preparation: "Take 300mg of standardized extract three times daily for mood stabilization. Requires consistent use for 4 to 6 weeks to reach full effect. Keep a mood journal to track changes.",
      timeline: "4 to 6 weeks for consistent mood stabilization", safety: "consult-practitioner",
      contraindications: "Significant drug interactions with SSRIs, birth control, blood thinners, and many others. Consult a practitioner.", storeMatch: false },
    { name: "Ashwagandha", latin: "Withania somnifera", forms: ["Capsule", "Powder", "Tincture"],
      preparation: "Take 300mg of standardized extract twice daily with meals. By regulating cortisol and supporting adrenal function, ashwagandha helps create a more stable emotional baseline.",
      timeline: "2 to 4 weeks of daily use", safety: "generally-safe",
      contraindications: "Avoid with thyroid medications unless supervised. Not recommended during pregnancy.", storeMatch: false },
    { name: "Lemon Balm", latin: "Melissa officinalis", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Drink 2 to 3 cups of lemon balm tea daily. The calming nervine properties help smooth emotional fluctuations throughout the day. Particularly helpful during hormonal shifts.",
      timeline: "Gentle stabilizing within 1 to 2 weeks of daily use", safety: "generally-safe",
      contraindications: "May interact with thyroid medications.", storeMatch: false },
  ],

  // ── Women's Health ─────────────────────────────────────────────────
  "PMS": [
    { name: "Vitex", latin: "Vitex agnus-castus", forms: ["Capsule", "Tincture"],
      preparation: "Take 20 to 40mg of standardized vitex extract daily in the morning. Vitex acts on the pituitary gland to help regulate progesterone levels. Results require consistent daily use across multiple cycles.",
      timeline: "3 to 6 menstrual cycles for full hormonal balancing", safety: "use-caution",
      contraindications: "Avoid with hormone-sensitive conditions, hormonal birth control, or hormone replacement therapy. Not for use during pregnancy.", storeMatch: false },
    { name: "Evening Primrose", latin: "Oenothera biennis", forms: ["Capsule", "Oil"],
      preparation: "Take 500 to 1000mg of evening primrose oil daily. The gamma-linolenic acid (GLA) supports prostaglandin production, helping reduce breast tenderness, bloating, and mood changes associated with PMS.",
      timeline: "2 to 3 menstrual cycles of consistent daily use", safety: "generally-safe",
      contraindications: "May interact with blood thinners. Avoid with seizure disorders.", storeMatch: false },
    { name: "Raspberry Leaf", latin: "Rubus idaeus", forms: ["Tea", "Capsule"],
      preparation: "Drink 2 to 3 cups of raspberry leaf tea daily throughout the cycle. This uterine tonic strengthens and tones the pelvic muscles, reducing cramp severity over time.",
      timeline: "Cumulative benefits over 2 to 3 cycles of regular use", safety: "generally-safe",
      contraindications: "Traditionally avoided in the first trimester of pregnancy.", storeMatch: false },
    { name: "Dong Quai", latin: "Angelica sinensis", forms: ["Capsule", "Tincture", "Tea"],
      preparation: "Take 500 to 600mg of dried root extract daily, or simmer sliced root in water for 15 minutes. Known as 'female ginseng' in Traditional Chinese Medicine, it supports healthy blood flow and hormonal balance.",
      timeline: "2 to 3 cycles of daily use", safety: "consult-practitioner",
      contraindications: "Avoid during pregnancy, with heavy menstrual bleeding, or with blood-thinning medications. Contains phytoestrogens.", storeMatch: false },
  ],
  "Hot Flashes": [
    { name: "Black Cohosh", latin: "Actaea racemosa", forms: ["Capsule", "Tincture"],
      preparation: "Take 20 to 40mg of standardized black cohosh extract twice daily. This is one of the most well-studied herbs for menopausal hot flashes, with numerous clinical trials supporting its use.",
      timeline: "4 to 8 weeks of daily use for significant reduction", safety: "consult-practitioner",
      contraindications: "Rare cases of liver toxicity reported. Avoid with liver conditions or estrogen-sensitive cancers. Limit use to 6 months.", storeMatch: false },
    { name: "Red Clover", latin: "Trifolium pratense", forms: ["Tea", "Capsule", "Tincture"],
      preparation: "Steep 1 to 2 teaspoons of dried red clover blossoms in hot water for 10 minutes. Drink 2 to 3 cups daily. The isoflavones genistein and daidzein provide mild estrogenic activity.",
      timeline: "4 to 12 weeks of daily use", safety: "use-caution",
      contraindications: "Avoid with estrogen-sensitive conditions or hormone-dependent cancers. May interact with blood thinners.", storeMatch: false },
    { name: "Sage", latin: "Salvia officinalis", forms: ["Tea", "Capsule", "Tincture"],
      preparation: "Drink 1 to 2 cups of sage tea daily, made with 1 teaspoon of dried leaves per cup. Clinical studies show sage extract can reduce hot flash frequency by up to 50% within 4 weeks.",
      timeline: "Noticeable reduction within 2 to 4 weeks", safety: "generally-safe",
      contraindications: "Avoid large medicinal doses during pregnancy. Do not use sage essential oil internally.", storeMatch: false },
    { name: "Dong Quai", latin: "Angelica sinensis", forms: ["Capsule", "Tincture", "Tea"],
      preparation: "Take 500mg of dried root extract daily. Often combined with other herbs in traditional formulas. Works best as part of a comprehensive approach to menopausal wellness.",
      timeline: "4 to 8 weeks of consistent use", safety: "consult-practitioner",
      contraindications: "Avoid with heavy bleeding, blood-thinning medications, or estrogen-sensitive conditions. Increases sun sensitivity.", storeMatch: false },
  ],
  "Menstrual Irregularity": [
    { name: "Vitex", latin: "Vitex agnus-castus", forms: ["Capsule", "Tincture"],
      preparation: "Take 20 to 40mg of standardized extract each morning on an empty stomach. Vitex is the premier herb for cycle regulation, working through the hypothalamic-pituitary axis to normalize hormonal signaling.",
      timeline: "3 to 6 months of daily use for cycle regulation", safety: "use-caution",
      contraindications: "Avoid with hormonal birth control, IVF treatments, or hormone-sensitive conditions. Not for use during pregnancy.", storeMatch: false },
    { name: "Dong Quai", latin: "Angelica sinensis", forms: ["Capsule", "Tincture", "Tea"],
      preparation: "Take 500mg of extract daily or drink dong quai root tea. In TCM, it is used to nourish blood and promote regular menstrual flow. Often combined with other herbs in formulas.",
      timeline: "3 to 4 cycles of consistent use", safety: "consult-practitioner",
      contraindications: "Avoid during menstruation if flow is heavy. Not for use during pregnancy or with blood thinners.", storeMatch: false },
    { name: "Raspberry Leaf", latin: "Rubus idaeus", forms: ["Tea", "Capsule"],
      preparation: "Drink 2 to 3 cups of raspberry leaf tea daily throughout the cycle. This gentle uterine tonic helps normalize muscle tone and supports regular cyclical patterns over time.",
      timeline: "Gradual improvement over 2 to 4 cycles", safety: "generally-safe",
      contraindications: "Traditionally avoided in the first trimester.", storeMatch: false },
  ],
  "Breast Tenderness": [
    { name: "Evening Primrose", latin: "Oenothera biennis", forms: ["Capsule", "Oil"],
      preparation: "Take 1000 to 1500mg of evening primrose oil daily in the second half of the menstrual cycle. The GLA content supports healthy prostaglandin balance, which can reduce cyclical breast tenderness.",
      timeline: "2 to 3 cycles of consistent use", safety: "generally-safe",
      contraindications: "May interact with blood thinners. Avoid with seizure disorders.", storeMatch: false },
    { name: "Vitex", latin: "Vitex agnus-castus", forms: ["Capsule", "Tincture"],
      preparation: "Take 20 to 40mg of standardized extract daily. Vitex helps correct the progesterone deficiency that often underlies cyclical breast tenderness.",
      timeline: "3 to 6 cycles for full hormonal adjustment", safety: "use-caution",
      contraindications: "Avoid with hormonal medications or hormone-sensitive conditions.", storeMatch: false },
    { name: "Dandelion Leaf", latin: "Taraxacum officinale", forms: ["Tea", "Tincture", "Fresh Greens"],
      preparation: "Brew 2 to 3 teaspoons of dried dandelion leaf in hot water for 10 minutes. Drink 2 to 3 cups daily in the week before menstruation. The mild diuretic effect helps reduce fluid-related breast swelling.",
      timeline: "Relief from fluid retention within 1 to 3 days", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy. May interact with diuretics or lithium.", storeMatch: false },
  ],

  // ── Circulation ────────────────────────────────────────────────────
  "Cold Hands and Feet": [
    { name: "Ginger", latin: "Zingiber officinale", forms: ["Tea", "Capsule", "Bath"],
      preparation: "Drink 2 to 3 cups of strong ginger tea daily to promote peripheral circulation. For a warming foot bath, add 2 tablespoons of grated ginger to hot water and soak for 20 minutes.",
      timeline: "Warming effect within 15 to 30 minutes; improved baseline circulation over weeks", safety: "generally-safe",
      contraindications: "May interact with blood thinners.", storeMatch: false },
    { name: "Cayenne", latin: "Capsicum annuum", forms: ["Capsule", "Tincture", "Tea"],
      preparation: "Add a small pinch of cayenne powder to warm water with lemon, or take 30 to 120mg in capsule form with food. Cayenne rapidly stimulates blood flow to the extremities through vasodilation.",
      timeline: "Warming effect within 10 to 20 minutes", safety: "generally-safe",
      contraindications: "May irritate the stomach in sensitive individuals. Start with very small doses.", storeMatch: false },
    { name: "Hawthorn", latin: "Crataegus monogyna", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Take 160 to 900mg of hawthorn berry extract daily, or brew 1 teaspoon of dried berries as tea. Hawthorn strengthens the heart and improves peripheral circulation as a long-term tonic.",
      timeline: "4 to 8 weeks of daily use for circulatory improvement", safety: "use-caution",
      contraindications: "May interact with heart medications. Consult a practitioner if on cardiac drugs.", storeMatch: false },
    { name: "Ginkgo", latin: "Ginkgo biloba", forms: ["Capsule", "Tincture"],
      preparation: "Take 120 to 240mg of standardized extract daily. Ginkgo improves microcirculation and blood flow to the small vessels in the fingers and toes.",
      timeline: "4 to 6 weeks of daily use", safety: "use-caution",
      contraindications: "May increase bleeding risk. Avoid with blood thinners and 2 weeks before surgery.", storeMatch: false },
  ],
  "Swelling": [
    { name: "Horse Chestnut", latin: "Aesculus hippocastanum", forms: ["Capsule", "Cream"],
      preparation: "Take 300mg of horse chestnut seed extract (standardized to 50mg aescin) twice daily. For topical use, apply horse chestnut cream to swollen areas. Aescin strengthens vein walls and reduces fluid leakage.",
      timeline: "2 to 4 weeks of daily use", safety: "use-caution",
      contraindications: "Use only commercially standardized extracts. Raw horse chestnuts are toxic. Avoid with kidney or liver disease.", storeMatch: false },
    { name: "Dandelion Leaf", latin: "Taraxacum officinale", forms: ["Tea", "Tincture", "Fresh Greens"],
      preparation: "Brew 3 to 4 cups of dandelion leaf tea daily. Unlike pharmaceutical diuretics, dandelion leaf naturally replaces the potassium lost through increased urination.",
      timeline: "Diuretic effect within 1 to 3 hours; reduced swelling over 3 to 5 days", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy. May interact with diuretics or lithium.", storeMatch: false },
    { name: "Nettle", latin: "Urtica dioica", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Drink 2 to 3 cups of nettle leaf tea daily. Nettle is a gentle, mineral-rich diuretic that supports the kidneys in managing fluid balance without depleting vital electrolytes.",
      timeline: "Mild diuretic effect within hours; cumulative benefit over 1 to 2 weeks", safety: "generally-safe",
      contraindications: "May lower blood sugar. Use caution with diabetes medications.", storeMatch: false },
  ],
  "Heavy Legs": [
    { name: "Horse Chestnut", latin: "Aesculus hippocastanum", forms: ["Capsule", "Cream"],
      preparation: "Take 300mg of standardized seed extract twice daily, and apply horse chestnut cream to legs in the evening. The aescin compound improves venous tone and reduces the sensation of heaviness.",
      timeline: "2 to 4 weeks of daily use", safety: "use-caution",
      contraindications: "Use standardized extracts only. Raw seeds are toxic. Avoid with kidney or liver conditions.", storeMatch: false },
    { name: "Butcher's Broom", latin: "Ruscus aculeatus", forms: ["Capsule", "Tea"],
      preparation: "Take 150mg of extract (standardized to 10% ruscogenins) twice daily. Butcher's broom has been approved in Europe for chronic venous insufficiency and the heavy, tired feeling in legs.",
      timeline: "2 to 4 weeks of consistent use", safety: "generally-safe",
      contraindications: "May interact with alpha-blockers and MAO inhibitors.", storeMatch: false },
    { name: "Gotu Kola", latin: "Centella asiatica", forms: ["Capsule", "Tea", "Tincture"],
      preparation: "Take 500mg of dried extract twice daily, or brew 1 to 2 teaspoons in hot water. Gotu kola strengthens connective tissue in vein walls and improves microcirculation in the lower limbs.",
      timeline: "4 to 8 weeks of daily use", safety: "generally-safe",
      contraindications: "Avoid with liver conditions. Rare cases of liver sensitivity reported at high doses.", storeMatch: false },
  ],

  // ── Detox and Cleansing ────────────────────────────────────────────
  "Liver Support": [
    { name: "Milk Thistle", latin: "Silybum marianum", forms: ["Capsule", "Tincture", "Tea"],
      preparation: "Take 200 to 400mg of standardized silymarin extract daily with meals. Silymarin protects liver cells from toxins and supports regeneration. It is one of the most studied hepatoprotective herbs.",
      timeline: "Liver enzyme improvements measurable within 4 to 8 weeks", safety: "generally-safe",
      contraindications: "May interact with certain medications metabolized by the liver. Avoid with Asteraceae allergy.", storeMatch: false },
    { name: "Dandelion Root", latin: "Taraxacum officinale", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Simmer 1 to 2 teaspoons of dried dandelion root in water for 15 minutes. Drink 2 to 3 cups daily. The bitter compounds stimulate bile production and support the liver's natural detoxification pathways.",
      timeline: "Digestive and liver support within 1 to 2 weeks of daily use", safety: "generally-safe",
      contraindications: "Avoid with bile duct obstruction or Asteraceae allergy.", storeMatch: false },
    { name: "Turmeric", latin: "Curcuma longa", forms: ["Capsule", "Tea", "Paste"],
      preparation: "Take 500mg of curcumin extract with black pepper daily, or make golden milk with 1 teaspoon of turmeric. Curcumin supports liver detoxification enzymes and reduces hepatic inflammation.",
      timeline: "Ongoing support with daily use over several weeks", safety: "generally-safe",
      contraindications: "May interact with blood thinners. Avoid supplemental doses with gallbladder disease.", storeMatch: false },
    { name: "Schisandra", latin: "Schisandra chinensis", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Take 500mg of dried schisandra berry extract daily, or simmer 1 teaspoon of dried berries for 15 minutes. Known as the 'five-flavor berry' in Chinese medicine, it supports both Phase I and Phase II liver detoxification.",
      timeline: "2 to 4 weeks of daily use", safety: "generally-safe",
      contraindications: "Avoid during pregnancy. May interact with medications metabolized by the liver.", storeMatch: false },
  ],
  "Water Retention": [
    { name: "Dandelion Leaf", latin: "Taraxacum officinale", forms: ["Tea", "Tincture", "Fresh Greens"],
      preparation: "Brew 3 to 4 cups of dandelion leaf tea daily. Unlike loop diuretics, dandelion naturally contains potassium, helping prevent the depletion that causes muscle cramps with other diuretics.",
      timeline: "Diuretic effect within 1 to 3 hours of first cup", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy. May interact with lithium or prescription diuretics.", storeMatch: false },
    { name: "Nettle", latin: "Urtica dioica", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Drink 2 to 3 cups of nettle leaf tea daily. Rich in minerals including potassium, iron, and silica, nettle supports kidney function and gentle fluid elimination.",
      timeline: "Noticeable fluid reduction within 1 to 3 days of regular use", safety: "generally-safe",
      contraindications: "May lower blood sugar. Use caution with diabetes medications or blood pressure drugs.", storeMatch: false },
    { name: "Parsley", latin: "Petroselinum crispum", forms: ["Tea", "Fresh", "Tincture"],
      preparation: "Steep a generous handful of fresh parsley (or 2 teaspoons dried) in hot water for 10 minutes. Drink 2 to 3 cups daily. Parsley is a potassium-sparing diuretic used in traditional European herbalism.",
      timeline: "Diuretic effect within 1 to 2 hours", safety: "generally-safe",
      contraindications: "Avoid medicinal doses during pregnancy (stimulates uterine contractions). Safe in culinary amounts.", storeMatch: false },
    { name: "Cleavers", latin: "Galium aparine", forms: ["Tea", "Tincture", "Fresh Juice"],
      preparation: "Steep 2 to 3 teaspoons of dried cleavers in hot water for 10 minutes, or juice fresh plants in spring. Cleavers is a gentle lymphatic herb that supports fluid drainage through the lymph system.",
      timeline: "Gentle action over 1 to 2 weeks of daily use", safety: "generally-safe",
      contraindications: "", storeMatch: false },
  ],
  "Sluggishness": [
    { name: "Dandelion Root", latin: "Taraxacum officinale", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Drink roasted dandelion root tea as a coffee alternative. Simmer 1 to 2 teaspoons in water for 15 minutes. The bitter compounds stimulate digestive juices and support the liver's cleansing work.",
      timeline: "Digestive stimulation within 30 to 60 minutes; overall vitality over 1 to 2 weeks", safety: "generally-safe",
      contraindications: "Avoid with bile duct obstruction or Asteraceae allergy.", storeMatch: false },
    { name: "Ginger", latin: "Zingiber officinale", forms: ["Tea", "Capsule", "Fresh"],
      preparation: "Start each morning with warm lemon and ginger tea. The warming quality stimulates circulation and digestion, countering the sluggish, stagnant feeling that accompanies a sluggish system.",
      timeline: "Warming and stimulating effect within 15 to 30 minutes", safety: "generally-safe",
      contraindications: "May interact with blood thinners at high doses.", storeMatch: false },
    { name: "Burdock Root", latin: "Arctium lappa", forms: ["Tea", "Tincture", "Food"],
      preparation: "Simmer 1 to 2 teaspoons of dried burdock root in water for 15 minutes. Drink 2 to 3 cups daily. Burdock is a classic alterative herb that gently supports the body's elimination channels.",
      timeline: "Gradual improvement over 2 to 4 weeks of daily use", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy. Use caution with diabetes medications as it may lower blood sugar.", storeMatch: false },
  ],
  "Seasonal Cleanse": [
    { name: "Burdock Root", latin: "Arctium lappa", forms: ["Tea", "Tincture", "Food"],
      preparation: "Simmer 1 to 2 teaspoons of dried root for 15 minutes and drink 2 to 3 cups daily for 2 to 4 weeks. Burdock is a cornerstone of spring cleansing traditions, supporting skin, liver, and lymph.",
      timeline: "Gradual cleansing over 2 to 4 weeks", safety: "generally-safe",
      contraindications: "Avoid with Asteraceae allergy. May lower blood sugar.", storeMatch: false },
    { name: "Red Clover", latin: "Trifolium pratense", forms: ["Tea", "Tincture", "Capsule"],
      preparation: "Steep 1 to 2 teaspoons of dried red clover blossoms in hot water for 10 to 15 minutes. Drink 2 to 3 cups daily. A traditional blood purifier and lymphatic cleanser used in spring tonic formulas.",
      timeline: "2 to 4 weeks of daily use as a seasonal tonic", safety: "use-caution",
      contraindications: "Contains isoflavones. Avoid with estrogen-sensitive conditions or blood-thinning medications.", storeMatch: false },
    { name: "Nettle", latin: "Urtica dioica", forms: ["Tea", "Tincture", "Fresh Greens"],
      preparation: "Harvest young nettle tops in spring (with gloves) and steam like spinach, or brew 2 cups of dried nettle tea daily. Nettle is a mineral-rich tonic that supports kidney function and gentle detoxification.",
      timeline: "Ongoing nutritive and cleansing support over 2 to 6 weeks", safety: "generally-safe",
      contraindications: "May lower blood sugar. Use caution with diabetes medications.", storeMatch: false },
    { name: "Cleavers", latin: "Galium aparine", forms: ["Tea", "Tincture", "Fresh Juice"],
      preparation: "Best used fresh in spring: juice the plant or make a cold infusion overnight. Cleavers is the quintessential spring cleansing herb, gently supporting lymphatic drainage and waste elimination.",
      timeline: "2 to 4 weeks of daily use during spring season", safety: "generally-safe",
      contraindications: "", storeMatch: false },
  ],
};

function safetyColor(level: SafetyLevel): string {
  switch (level) {
    case "generally-safe":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "use-caution":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "consult-practitioner":
      return "bg-red-500/10 text-red-600 dark:text-red-400";
  }
}

function safetyLabel(level: SafetyLevel): string {
  switch (level) {
    case "generally-safe":
      return "Generally Safe";
    case "use-caution":
      return "Use Caution";
    case "consult-practitioner":
      return "Consult Practitioner";
  }
}

export default function Remedies() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [showQuickRef, setShowQuickRef] = useState(false);

  const currentCategory = CATEGORIES.find((c) => c.name === selectedCategory);
  const herbs = selectedSymptom ? SYMPTOM_HERBS[selectedSymptom] ?? [] : [];

  const handleCategorySelect = (name: string) => {
    setSelectedCategory(name);
    setSelectedSymptom(null);
  };

  const handleBack = () => {
    if (selectedSymptom) {
      setSelectedSymptom(null);
    } else {
      setSelectedCategory(null);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <motion.div {...fadeUp} className="text-center mb-12">
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-gradient">Botanical Remedy Finder</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed mb-6">
              Ancient plant wisdom for modern wellness
            </p>
            <div className="glass rounded-xl p-4 max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed text-left">
                  For educational purposes only. This is not medical advice. Always
                  consult a qualified healthcare provider before using herbal
                  remedies, especially if pregnant, nursing, or taking medications.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Two-step selector + results */}
          <AnimatePresence mode="wait">
            {!selectedCategory ? (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="font-display text-xl font-semibold text-center mb-8">
                  What are you looking to address?
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {CATEGORIES.map((cat, i) => (
                    <motion.button
                      key={cat.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleCategorySelect(cat.name)}
                      className="glass-card text-left group cursor-pointer hover:ring-2 hover:ring-brand-500/30 transition-all"
                    >
                      <cat.icon className="w-8 h-8 text-brand-500 mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="font-display font-semibold text-sm sm:text-base">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {cat.symptoms.length} symptoms
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : !selectedSymptom ? (
              <motion.div
                key="symptoms"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-500 transition-colors mb-6"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to categories
                </button>
                <h2 className="font-display text-2xl font-bold mb-2">
                  {selectedCategory}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                  Select a specific symptom to see recommended herbal remedies.
                </p>
                <div className="flex flex-wrap gap-3">
                  {currentCategory?.symptoms.map((symptom, i) => (
                    <motion.button
                      key={symptom}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedSymptom(symptom)}
                      className="glass px-5 py-3 rounded-xl text-sm font-medium hover:ring-2 hover:ring-brand-500/30 hover:bg-brand-500/5 transition-all cursor-pointer"
                    >
                      {symptom}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-500 transition-colors mb-6"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to symptoms
                </button>
                <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
                  Remedies for{" "}
                  <span className="text-gradient">{selectedSymptom}</span>
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                  {herbs.length} traditional herbal remedies
                </p>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {herbs.map((herb, i) => (
                    <motion.div
                      key={herb.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-card flex flex-col"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h3 className="font-display font-bold text-lg leading-tight">
                            {herb.name}
                          </h3>
                          <p className="text-xs text-gray-500 italic">
                            {herb.latin}
                          </p>
                        </div>
                        {herb.storeMatch && (
                          <Link href="/store">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-brand-500/10 text-brand-500 text-[10px] font-medium cursor-pointer hover:bg-brand-500/20 transition-colors whitespace-nowrap">
                              <ShoppingBag className="w-3 h-3" /> Available in
                              our store
                            </span>
                          </Link>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {herb.forms.map((f) => (
                          <span
                            key={f}
                            className="px-2 py-0.5 rounded-full glass text-[10px] font-medium"
                          >
                            {f}
                          </span>
                        ))}
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3 flex-1">
                        {herb.preparation}
                      </p>

                      <div className="flex items-center gap-2 text-xs mb-3">
                        <span className="uppercase tracking-widest text-gray-400 text-[10px]">
                          Timeline
                        </span>
                        <span className="font-medium">{herb.timeline}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-auto">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${safetyColor(herb.safety)}`}
                        >
                          {herb.safety === "generally-safe" ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          {safetyLabel(herb.safety)}
                        </span>
                      </div>

                      {herb.contraindications && (
                        <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                          {herb.contraindications}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Store Connection */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: herbs.length * 0.1 + 0.2 }}
                  className="mt-12 glass-card text-center"
                >
                  <ShoppingBag className="w-8 h-8 text-brand-500 mx-auto mb-3" />
                  <h3 className="font-display font-bold text-lg mb-2">
                    Looking for ready-made remedies?
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                    Browse our handcrafted healing salves and crystal-infused
                    products.
                  </p>
                  <Link href="/store">
                    <span className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm cursor-pointer">
                      Visit the Store{" "}
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Reference Guide */}
          <motion.div {...fadeUp} className="mt-16">
            <button
              onClick={() => setShowQuickRef((v) => !v)}
              className="w-full glass rounded-xl p-4 flex items-center justify-between hover:ring-2 hover:ring-brand-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-brand-500" />
                <span className="font-display font-semibold">
                  Quick Reference Guide
                </span>
              </div>
              {showQuickRef ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            <AnimatePresence>
              {showQuickRef && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                    {QUICK_REFERENCE.map((ref, i) => (
                      <motion.div
                        key={ref.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card"
                      >
                        <h4 className="font-display font-semibold mb-2">
                          {ref.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          {ref.content}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
