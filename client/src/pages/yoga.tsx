import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flower2, Wind, Flame, Droplets, Mountain, Sun, Moon, Heart,
  Star, Sparkles, Eye, Shield, TreePine, ChevronRight, RotateCcw,
  Plus, X, Timer, Shuffle, ArrowRight, CircleDot, Layers
} from "lucide-react";

type Difficulty = "beginner" | "intermediate" | "advanced";
type Category = "standing" | "seated" | "balance" | "inversion" | "twist" | "restorative";
type Chakra = "Root" | "Sacral" | "Solar Plexus" | "Heart" | "Throat" | "Third Eye" | "Crown";
type Element = "Earth" | "Water" | "Fire" | "Air" | "Ether";

interface YogaPose {
  id: string;
  sanskrit: string;
  english: string;
  difficulty: Difficulty;
  category: Category;
  benefits: string[];
  instructions: string[];
  contraindications: string[];
  chakra: Chakra;
  element: Element;
  holdTime: string;
}

interface MoodFlow {
  name: string;
  description: string;
  gradient: string;
  icon: typeof Sun;
  poseIds: string[];
  timing: string;
}

interface ChakraColor {
  name: string;
  chakra: Chakra;
  color: string;
  gradient: string;
  healing: string;
  affirmation: string;
  poseIds: string[];
}

interface TruthCard {
  message: string;
  source: string;
}

const POSES: YogaPose[] = [
  {
    id: "tadasana",
    sanskrit: "Tadasana",
    english: "Mountain Pose",
    difficulty: "beginner",
    category: "standing",
    benefits: ["Improves posture and body awareness", "Strengthens thighs, knees, and ankles", "Cultivates stillness and grounding"],
    instructions: [
      "Stand with feet together, weight balanced evenly across both feet.",
      "Engage your thigh muscles and lift your kneecaps gently.",
      "Lengthen the tailbone toward the floor and lift the crown of your head toward the sky.",
      "Let arms rest alongside your body with palms facing forward."
    ],
    contraindications: ["Headache", "Low blood pressure"],
    chakra: "Root",
    element: "Earth",
    holdTime: "30-60 seconds"
  },
  {
    id: "virabhadrasana-i",
    sanskrit: "Virabhadrasana I",
    english: "Warrior I",
    difficulty: "beginner",
    category: "standing",
    benefits: ["Strengthens legs, shoulders, and back", "Opens chest and hip flexors", "Builds focus and determination"],
    instructions: [
      "Step one foot back 3 to 4 feet, turning the back foot out about 45 degrees.",
      "Bend the front knee over the ankle, keeping the thigh parallel to the floor.",
      "Raise both arms overhead with palms facing each other.",
      "Square the hips forward and gaze upward between your hands."
    ],
    contraindications: ["High blood pressure", "Heart conditions", "Shoulder injuries"],
    chakra: "Solar Plexus",
    element: "Fire",
    holdTime: "30-60 seconds per side"
  },
  {
    id: "virabhadrasana-ii",
    sanskrit: "Virabhadrasana II",
    english: "Warrior II",
    difficulty: "beginner",
    category: "standing",
    benefits: ["Strengthens legs and ankles", "Opens hips and chest", "Builds stamina and concentration"],
    instructions: [
      "Stand with feet wide apart, turning the front foot forward and the back foot parallel to the short edge of your mat.",
      "Bend the front knee to a 90 degree angle, stacking it over the ankle.",
      "Extend arms out at shoulder height, parallel to the floor.",
      "Gaze over the front fingertips with a steady, soft focus."
    ],
    contraindications: ["Neck problems (do not turn head)", "Knee injuries"],
    chakra: "Sacral",
    element: "Water",
    holdTime: "30-60 seconds per side"
  },
  {
    id: "virabhadrasana-iii",
    sanskrit: "Virabhadrasana III",
    english: "Warrior III",
    difficulty: "advanced",
    category: "balance",
    benefits: ["Strengthens the entire back body", "Improves balance and coordination", "Tones the abdominal muscles"],
    instructions: [
      "From Warrior I, shift your weight onto the front foot.",
      "Hinge forward at the hips, lifting the back leg to hip height.",
      "Extend arms forward alongside the ears or rest hands at the heart.",
      "Keep hips level and body in one long line from fingertips to back heel."
    ],
    contraindications: ["High blood pressure", "Balance disorders"],
    chakra: "Solar Plexus",
    element: "Fire",
    holdTime: "15-30 seconds per side"
  },
  {
    id: "vrksasana",
    sanskrit: "Vrksasana",
    english: "Tree Pose",
    difficulty: "beginner",
    category: "balance",
    benefits: ["Improves balance and stability", "Strengthens the standing leg", "Promotes mental clarity and focus"],
    instructions: [
      "Stand on one leg and place the sole of the opposite foot on the inner thigh or calf, avoiding the knee.",
      "Press the foot and leg into each other for stability.",
      "Bring hands to heart center or extend arms overhead like branches.",
      "Fix your gaze on a single point in front of you."
    ],
    contraindications: ["Recent ankle or knee injury", "Low blood pressure"],
    chakra: "Root",
    element: "Earth",
    holdTime: "30-60 seconds per side"
  },
  {
    id: "adho-mukha-svanasana",
    sanskrit: "Adho Mukha Svanasana",
    english: "Downward Facing Dog",
    difficulty: "beginner",
    category: "standing",
    benefits: ["Stretches the entire back body", "Strengthens arms and legs", "Calms the mind and relieves stress"],
    instructions: [
      "Begin on hands and knees, hands shoulder-width apart and knees hip-width apart.",
      "Tuck the toes and lift the hips up and back, straightening the legs as much as comfortable.",
      "Press the chest gently toward the thighs, keeping the spine long.",
      "Relax the head between the upper arms and breathe deeply."
    ],
    contraindications: ["Carpal tunnel syndrome", "Late-term pregnancy", "Unmanaged high blood pressure"],
    chakra: "Third Eye",
    element: "Air",
    holdTime: "1-3 minutes"
  },
  {
    id: "balasana",
    sanskrit: "Balasana",
    english: "Child's Pose",
    difficulty: "beginner",
    category: "restorative",
    benefits: ["Gently stretches the hips, thighs, and ankles", "Calms the nervous system", "Releases tension in the back and shoulders"],
    instructions: [
      "Kneel on the floor with big toes touching and knees hip-width apart.",
      "Sit back onto the heels and fold forward, draping the torso between the thighs.",
      "Extend arms forward on the floor or rest them alongside the body.",
      "Let the forehead rest on the mat and breathe into the back body."
    ],
    contraindications: ["Knee injury", "Diarrhea", "Pregnancy (use wide-knee variation)"],
    chakra: "Third Eye",
    element: "Earth",
    holdTime: "1-5 minutes"
  },
  {
    id: "bhujangasana",
    sanskrit: "Bhujangasana",
    english: "Cobra Pose",
    difficulty: "beginner",
    category: "restorative",
    benefits: ["Strengthens the spine and opens the chest", "Stimulates abdominal organs", "Helps relieve fatigue and mild depression"],
    instructions: [
      "Lie face down with legs extended and the tops of the feet on the floor.",
      "Place hands beneath the shoulders with elbows close to the body.",
      "Inhale and gently lift the chest, using your back muscles more than your hands.",
      "Keep a slight bend in the elbows and draw the shoulders away from the ears."
    ],
    contraindications: ["Back injury", "Carpal tunnel syndrome", "Pregnancy"],
    chakra: "Heart",
    element: "Fire",
    holdTime: "15-30 seconds"
  },
  {
    id: "setu-bandhasana",
    sanskrit: "Setu Bandhasana",
    english: "Bridge Pose",
    difficulty: "beginner",
    category: "restorative",
    benefits: ["Stretches chest, neck, and spine", "Strengthens glutes and hamstrings", "Reduces anxiety, fatigue, and insomnia"],
    instructions: [
      "Lie on your back with knees bent and feet hip-width apart, close to the sitting bones.",
      "Press feet and arms into the floor and lift the hips toward the ceiling.",
      "Roll the shoulders underneath and clasp the hands beneath the pelvis.",
      "Hold the lift while keeping the thighs parallel and breathe steadily."
    ],
    contraindications: ["Neck injury", "Shoulder injury"],
    chakra: "Throat",
    element: "Ether",
    holdTime: "30-60 seconds"
  },
  {
    id: "trikonasana",
    sanskrit: "Trikonasana",
    english: "Triangle Pose",
    difficulty: "intermediate",
    category: "standing",
    benefits: ["Stretches legs, hips, and spine", "Opens the chest and shoulders", "Stimulates digestion and relieves stress"],
    instructions: [
      "Stand with feet wide, front foot pointing forward and back foot turned slightly inward.",
      "Extend arms at shoulder height and hinge at the hip over the front leg.",
      "Lower the front hand to the shin, ankle, or floor while the top arm reaches skyward.",
      "Turn the gaze upward toward the raised hand, keeping both sides of the torso long."
    ],
    contraindications: ["Low blood pressure", "Headache", "Neck problems (gaze forward instead of up)"],
    chakra: "Sacral",
    element: "Water",
    holdTime: "30-60 seconds per side"
  },
  {
    id: "marjaryasana-bitilasana",
    sanskrit: "Marjaryasana-Bitilasana",
    english: "Cat-Cow Pose",
    difficulty: "beginner",
    category: "restorative",
    benefits: ["Warms up the spine and increases flexibility", "Massages abdominal organs", "Coordinates breath with movement for calm focus"],
    instructions: [
      "Start on all fours with wrists under shoulders and knees under hips.",
      "On an inhale, drop the belly, lift the chest, and look forward (Cow).",
      "On an exhale, round the spine toward the ceiling, tucking chin to chest (Cat).",
      "Continue flowing between the two positions for several breaths."
    ],
    contraindications: ["Neck injury (keep head in neutral)"],
    chakra: "Heart",
    element: "Air",
    holdTime: "5-10 breath cycles"
  },
  {
    id: "padmasana",
    sanskrit: "Padmasana",
    english: "Lotus Pose",
    difficulty: "advanced",
    category: "seated",
    benefits: ["Opens the hips deeply", "Calms the mind for meditation", "Stimulates the pelvis, spine, abdomen, and bladder"],
    instructions: [
      "Sit with legs extended. Bend the right knee and place the right foot on the left thigh, sole facing up.",
      "Bend the left knee and place the left foot on the right thigh in the same manner.",
      "Rest hands on the knees in a mudra of your choice.",
      "Lengthen the spine, close the eyes, and breathe slowly."
    ],
    contraindications: ["Knee injury", "Ankle injury", "Tight hips (use Half Lotus instead)"],
    chakra: "Crown",
    element: "Ether",
    holdTime: "1-10 minutes"
  },
  {
    id: "savasana",
    sanskrit: "Savasana",
    english: "Corpse Pose",
    difficulty: "beginner",
    category: "restorative",
    benefits: ["Activates the parasympathetic nervous system", "Integrates the benefits of the practice", "Reduces blood pressure and promotes deep relaxation"],
    instructions: [
      "Lie flat on your back with arms at your sides, palms facing upward.",
      "Let your feet fall open to either side naturally.",
      "Close your eyes and release every muscle in the body, starting from the toes and moving to the crown.",
      "Remain still for 5 to 15 minutes, observing the breath without changing it."
    ],
    contraindications: ["Back discomfort (place a bolster under knees)"],
    chakra: "Crown",
    element: "Ether",
    holdTime: "5-15 minutes"
  },
  {
    id: "eka-pada-rajakapotasana",
    sanskrit: "Eka Pada Rajakapotasana",
    english: "Pigeon Pose",
    difficulty: "intermediate",
    category: "seated",
    benefits: ["Deep hip opener that releases stored tension", "Stretches hip flexors and lower back", "Encourages emotional release and letting go"],
    instructions: [
      "From Downward Dog, bring the right knee forward behind the right wrist.",
      "Extend the left leg straight back with the top of the foot on the floor.",
      "Square the hips as much as possible toward the front of the mat.",
      "Walk the hands forward and fold over the front shin for a deeper stretch."
    ],
    contraindications: ["Knee injury", "Sacroiliac issues", "Tight hips (use a bolster under the hip)"],
    chakra: "Sacral",
    element: "Water",
    holdTime: "1-3 minutes per side"
  },
  {
    id: "garudasana",
    sanskrit: "Garudasana",
    english: "Eagle Pose",
    difficulty: "intermediate",
    category: "balance",
    benefits: ["Improves balance and focus", "Stretches shoulders and upper back", "Strengthens calves and ankles"],
    instructions: [
      "Stand on the right foot. Cross the left thigh over the right, hooking the left foot behind the right calf if possible.",
      "Extend arms forward, cross the right arm under the left, and bring the palms together.",
      "Sink the hips and lift the elbows to shoulder height.",
      "Hold steady with a focused gaze, then repeat on the other side."
    ],
    contraindications: ["Knee injury", "Recent ankle sprain"],
    chakra: "Third Eye",
    element: "Air",
    holdTime: "15-30 seconds per side"
  },
  {
    id: "ustrasana",
    sanskrit: "Ustrasana",
    english: "Camel Pose",
    difficulty: "intermediate",
    category: "restorative",
    benefits: ["Opens the entire front body", "Strengthens the back muscles", "Stimulates the throat and heart chakras"],
    instructions: [
      "Kneel with knees hip-width apart and thighs perpendicular to the floor.",
      "Place hands on the lower back with fingers pointing down for support.",
      "Lift the chest and begin to arch back, reaching for the heels one hand at a time.",
      "Let the head drop back gently if comfortable, keeping the hips over the knees."
    ],
    contraindications: ["Low or high blood pressure", "Serious low back or neck injury", "Migraine"],
    chakra: "Heart",
    element: "Fire",
    holdTime: "15-30 seconds"
  },
  {
    id: "matsyasana",
    sanskrit: "Matsyasana",
    english: "Fish Pose",
    difficulty: "intermediate",
    category: "restorative",
    benefits: ["Opens the chest and throat", "Stretches the hip flexors and intercostal muscles", "Balances the effects of shoulder stand"],
    instructions: [
      "Lie on your back with legs together and arms alongside the body.",
      "Slide your hands under the hips, palms down, pressing the forearms into the floor.",
      "Lift the chest toward the ceiling, arching the upper back.",
      "Tilt the head back so the crown lightly touches the floor, keeping the weight on the forearms."
    ],
    contraindications: ["Serious neck injury", "High or low blood pressure", "Insomnia"],
    chakra: "Throat",
    element: "Water",
    holdTime: "15-30 seconds"
  },
  {
    id: "navasana",
    sanskrit: "Navasana",
    english: "Boat Pose",
    difficulty: "intermediate",
    category: "seated",
    benefits: ["Strengthens the core, hip flexors, and spine", "Improves balance and digestion", "Builds willpower and confidence"],
    instructions: [
      "Sit with knees bent and feet on the floor, hands behind the knees.",
      "Lean back slightly and lift the feet off the floor, bringing shins parallel to the floor.",
      "Release the hands and extend the arms forward, parallel to the floor.",
      "For full expression, straighten the legs to form a V shape with the body."
    ],
    contraindications: ["Pregnancy", "Recent abdominal surgery", "Low blood pressure"],
    chakra: "Solar Plexus",
    element: "Fire",
    holdTime: "10-30 seconds"
  },
  {
    id: "ardha-chandrasana",
    sanskrit: "Ardha Chandrasana",
    english: "Half Moon Pose",
    difficulty: "intermediate",
    category: "balance",
    benefits: ["Strengthens ankles, legs, and core", "Opens the chest and shoulders", "Improves coordination and sense of balance"],
    instructions: [
      "From Triangle Pose, bend the front knee and step the back foot in.",
      "Place the front hand on the floor about 12 inches ahead and lift the back leg parallel to the floor.",
      "Stack the hips and open the chest, extending the top arm toward the sky.",
      "Gaze upward if balance allows, keeping the body in one plane."
    ],
    contraindications: ["Headache", "Low blood pressure", "Insomnia"],
    chakra: "Third Eye",
    element: "Air",
    holdTime: "15-30 seconds per side"
  },
  {
    id: "phalakasana",
    sanskrit: "Phalakasana",
    english: "Plank Pose",
    difficulty: "beginner",
    category: "standing",
    benefits: ["Builds core, arm, and shoulder strength", "Tones the abdominal muscles", "Prepares the body for arm balances"],
    instructions: [
      "Start on all fours, then step the feet back to create a straight line from head to heels.",
      "Stack the shoulders over the wrists and spread the fingers wide.",
      "Engage the core and press back through the heels.",
      "Keep the neck in line with the spine and hold with steady breath."
    ],
    contraindications: ["Carpal tunnel syndrome", "Shoulder injury"],
    chakra: "Solar Plexus",
    element: "Fire",
    holdTime: "30-60 seconds"
  },
  {
    id: "paschimottanasana",
    sanskrit: "Paschimottanasana",
    english: "Seated Forward Bend",
    difficulty: "beginner",
    category: "seated",
    benefits: ["Stretches the entire back body", "Calms the nervous system", "Aids digestion and relieves menstrual discomfort"],
    instructions: [
      "Sit with legs extended in front of you, feet flexed.",
      "Inhale and lengthen the spine, reaching arms overhead.",
      "Exhale and fold forward from the hips, reaching for the feet or shins.",
      "Keep the spine as long as possible rather than rounding toward the legs."
    ],
    contraindications: ["Herniated disc", "Sciatica", "Asthma"],
    chakra: "Sacral",
    element: "Water",
    holdTime: "1-3 minutes"
  },
  {
    id: "sarvangasana",
    sanskrit: "Sarvangasana",
    english: "Shoulder Stand",
    difficulty: "advanced",
    category: "inversion",
    benefits: ["Stimulates the thyroid and parathyroid glands", "Improves circulation and calms the mind", "Strengthens the shoulders, arms, and core"],
    instructions: [
      "Lie on your back. Lift the legs overhead and support the lower back with both hands.",
      "Walk the hands higher toward the shoulder blades, straightening the legs toward the ceiling.",
      "Align shoulders, hips, and ankles in one vertical line.",
      "Hold steady with chin tucked toward the chest, breathing deeply."
    ],
    contraindications: ["Neck injury", "High blood pressure", "Menstruation", "Glaucoma"],
    chakra: "Throat",
    element: "Ether",
    holdTime: "30 seconds to 3 minutes"
  },
];

const MOOD_FLOWS: MoodFlow[] = [
  {
    name: "Energizing Morning",
    description: "Wake up the body and spark vitality with an invigorating sunrise sequence.",
    gradient: "from-amber-400 to-orange-500",
    icon: Sun,
    poseIds: ["tadasana", "marjaryasana-bitilasana", "adho-mukha-svanasana", "virabhadrasana-i", "virabhadrasana-ii", "trikonasana", "phalakasana"],
    timing: "Hold each pose 30 to 45 seconds. Total flow: 12 to 15 minutes."
  },
  {
    name: "Stress Relief",
    description: "Release accumulated tension and quiet the mind with slow, grounding holds.",
    gradient: "from-blue-400 to-indigo-500",
    icon: Wind,
    poseIds: ["balasana", "marjaryasana-bitilasana", "adho-mukha-svanasana", "paschimottanasana", "setu-bandhasana", "savasana"],
    timing: "Hold each pose 1 to 2 minutes. Total flow: 10 to 15 minutes."
  },
  {
    name: "Deep Stretch",
    description: "Lengthen fascia and open tight areas with patient, breath-led holds.",
    gradient: "from-teal-400 to-cyan-500",
    icon: Droplets,
    poseIds: ["marjaryasana-bitilasana", "adho-mukha-svanasana", "trikonasana", "eka-pada-rajakapotasana", "paschimottanasana", "matsyasana", "savasana"],
    timing: "Hold each pose 1 to 3 minutes. Total flow: 15 to 25 minutes."
  },
  {
    name: "Heart Opening",
    description: "Expand the chest, release emotional armor, and cultivate compassion.",
    gradient: "from-rose-400 to-pink-500",
    icon: Heart,
    poseIds: ["marjaryasana-bitilasana", "bhujangasana", "ustrasana", "setu-bandhasana", "matsyasana", "savasana"],
    timing: "Hold each pose 30 to 60 seconds. Total flow: 10 to 15 minutes."
  },
  {
    name: "Grounding",
    description: "Root into the present moment with stable, earthy postures that foster calm certainty.",
    gradient: "from-emerald-500 to-green-600",
    icon: Mountain,
    poseIds: ["tadasana", "vrksasana", "virabhadrasana-ii", "trikonasana", "balasana", "padmasana", "savasana"],
    timing: "Hold each pose 45 to 90 seconds. Total flow: 12 to 18 minutes."
  },
  {
    name: "Sleep Preparation",
    description: "Transition the nervous system into rest mode with gentle, restorative postures.",
    gradient: "from-violet-500 to-purple-600",
    icon: Moon,
    poseIds: ["marjaryasana-bitilasana", "balasana", "eka-pada-rajakapotasana", "paschimottanasana", "setu-bandhasana", "savasana"],
    timing: "Hold each pose 2 to 5 minutes. Total flow: 15 to 30 minutes."
  },
];

const CHAKRA_COLORS: ChakraColor[] = [
  { name: "Red", chakra: "Root", color: "bg-red-500", gradient: "from-red-500 to-red-700", healing: "Stability, security, and physical vitality. Red activates the survival instinct and reconnects you with the body.", affirmation: "I am safe. I am grounded. I belong in this world.", poseIds: ["tadasana", "vrksasana", "virabhadrasana-i"] },
  { name: "Orange", chakra: "Sacral", color: "bg-orange-500", gradient: "from-orange-400 to-orange-600", healing: "Creativity, pleasure, and emotional flow. Orange restores enthusiasm and the capacity to feel deeply.", affirmation: "I embrace my feelings. I create with joy and passion.", poseIds: ["eka-pada-rajakapotasana", "trikonasana", "virabhadrasana-ii"] },
  { name: "Yellow", chakra: "Solar Plexus", color: "bg-yellow-400", gradient: "from-yellow-300 to-amber-500", healing: "Confidence, willpower, and personal authority. Yellow ignites the inner fire of self-trust.", affirmation: "I am strong. I am capable. I honor my own power.", poseIds: ["navasana", "phalakasana", "virabhadrasana-iii"] },
  { name: "Green", chakra: "Heart", color: "bg-green-500", gradient: "from-emerald-400 to-green-600", healing: "Love, compassion, and forgiveness. Green harmonizes giving and receiving and dissolves resentment.", affirmation: "I give and receive love freely. My heart is open.", poseIds: ["bhujangasana", "ustrasana", "marjaryasana-bitilasana"] },
  { name: "Blue", chakra: "Throat", color: "bg-blue-500", gradient: "from-blue-400 to-blue-600", healing: "Communication, truth, and authentic expression. Blue clears the channel between what you feel and what you say.", affirmation: "I speak my truth with clarity and kindness.", poseIds: ["setu-bandhasana", "matsyasana", "sarvangasana"] },
  { name: "Indigo", chakra: "Third Eye", color: "bg-indigo-500", gradient: "from-indigo-400 to-indigo-600", healing: "Intuition, insight, and inner vision. Indigo sharpens perception beyond the five senses.", affirmation: "I trust my inner wisdom. I see clearly.", poseIds: ["balasana", "adho-mukha-svanasana", "garudasana"] },
  { name: "Violet", chakra: "Crown", color: "bg-violet-500", gradient: "from-violet-400 to-purple-600", healing: "Spiritual connection, unity, and transcendence. Violet dissolves the illusion of separation.", affirmation: "I am one with all that is. I am divine light.", poseIds: ["padmasana", "savasana", "sarvangasana"] },
];

const TRUTH_CARDS: TruthCard[] = [
  { message: "The body benefits from movement, and the mind benefits from stillness.", source: "Sakyong Mipham" },
  { message: "Yoga is the journey of the self, through the self, to the self.", source: "The Bhagavad Gita" },
  { message: "The pose begins when you want to leave it.", source: "B.K.S. Iyengar" },
  { message: "Inhale the future, exhale the past.", source: "Yogic Proverb" },
  { message: "You cannot do yoga. Yoga is your natural state.", source: "Sharon Gannon" },
  { message: "The rhythm of the body, the melody of the mind, and the harmony of the soul create the symphony of life.", source: "B.K.S. Iyengar" },
  { message: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.", source: "Thich Nhat Hanh" },
  { message: "The nature of yoga is to shine the light of awareness into the darkest corners of the body.", source: "Jason Crandell" },
  { message: "Be where you are, not where you think you should be.", source: "Yogic Wisdom" },
  { message: "Peace comes from within. Do not seek it without.", source: "Siddhartha Gautama" },
  { message: "Quiet the mind, and the soul will speak.", source: "Ma Jaya Sati Bhagavati" },
  { message: "The only way out is through.", source: "Robert Frost" },
  { message: "When you own your breath, nobody can steal your peace.", source: "Yogic Proverb" },
  { message: "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it.", source: "Rumi" },
  { message: "What you think, you become. What you feel, you attract. What you imagine, you create.", source: "Buddha" },
  { message: "The wound is the place where the Light enters you.", source: "Rumi" },
  { message: "In the midst of movement and chaos, keep stillness inside of you.", source: "Deepak Chopra" },
  { message: "Yoga does not just change the way we see things. It transforms the person who sees.", source: "B.K.S. Iyengar" },
  { message: "The present moment is filled with joy and happiness. If you are attentive, you will see it.", source: "Thich Nhat Hanh" },
  { message: "Surrender is not giving up. Surrender is letting go of resistance.", source: "Yogic Wisdom" },
  { message: "Where attention goes, energy flows.", source: "James Redfield" },
  { message: "An ounce of practice is worth more than tons of preaching.", source: "Mahatma Gandhi" },
  { message: "Do not dwell in the past, do not dream of the future. Concentrate the mind on the present moment.", source: "Buddha" },
  { message: "Flexibility is not just about touching your toes. It is about what you learn on the way down.", source: "Jigar Gor" },
  { message: "Let go of who you think you are supposed to be and embrace who you are.", source: "Brene Brown" },
  { message: "True yoga is not about the shape of your body, but the shape of your life.", source: "Aadil Palkhivala" },
  { message: "You are the sky. Everything else is just weather.", source: "Pema Chodron" },
];

const CATEGORY_META: Record<Category, { label: string; gradient: string }> = {
  standing: { label: "Standing", gradient: "from-amber-400 to-orange-500" },
  seated: { label: "Seated", gradient: "from-indigo-400 to-purple-500" },
  balance: { label: "Balance", gradient: "from-teal-400 to-cyan-500" },
  inversion: { label: "Inversion", gradient: "from-violet-400 to-purple-600" },
  twist: { label: "Twist", gradient: "from-emerald-400 to-green-500" },
  restorative: { label: "Restorative", gradient: "from-blue-400 to-indigo-500" },
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  advanced: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

type Section = "poses" | "flow-builder" | "mood-flows" | "color-therapy" | "truth-cards";

const SECTION_TABS: { id: Section; label: string; icon: typeof Flower2 }[] = [
  { id: "poses", label: "Pose Library", icon: Flower2 },
  { id: "flow-builder", label: "Flow Builder", icon: Layers },
  { id: "mood-flows", label: "Mood Flows", icon: Sparkles },
  { id: "color-therapy", label: "Color Therapy", icon: CircleDot },
  { id: "truth-cards", label: "Truth Cards", icon: Star },
];

function getPoseById(id: string): YogaPose | undefined {
  return POSES.find((p) => p.id === id);
}

function PoseCard({ pose, onAdd, isInFlow }: { pose: YogaPose; onAdd?: () => void; isInFlow?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const meta = CATEGORY_META[pose.category];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card cursor-pointer group"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[pose.difficulty]}`}>
              {pose.difficulty}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${meta.gradient} text-white`}>
              {meta.label}
            </span>
          </div>
          <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white mt-2">
            {pose.english}
          </h3>
          <p className="text-sm text-brand-400 italic">{pose.sanskrit}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><Timer className="w-3 h-3" />{pose.holdTime}</span>
            <span>{pose.chakra} Chakra</span>
            <span>{pose.element}</span>
          </div>
        </div>
        {onAdd && (
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(); }}
            className={`p-2 rounded-xl transition-all ${isInFlow ? "bg-brand-500/20 text-brand-400" : "glass hover:bg-brand-500/10 text-gray-400 hover:text-brand-400"}`}
            title={isInFlow ? "Already in flow" : "Add to flow"}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-400 mb-1">Benefits</h4>
                <ul className="space-y-1">
                  {pose.benefits.map((b, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                      <Sparkles className="w-3 h-3 mt-1 text-brand-400 shrink-0" />{b}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-400 mb-1">Instructions</h4>
                <ol className="space-y-1 list-decimal list-inside">
                  {pose.instructions.map((inst, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-300">{inst}</li>
                  ))}
                </ol>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-1">Contraindications</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{pose.contraindications.join(", ")}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Yoga() {
  const [section, setSection] = useState<Section>("poses");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all");
  const [flowPoseIds, setFlowPoseIds] = useState<string[]>([]);
  const [activeChakra, setActiveChakra] = useState<ChakraColor | null>(null);
  const [drawnCard, setDrawnCard] = useState<TruthCard | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [expandedMoodFlow, setExpandedMoodFlow] = useState<string | null>(null);

  const filteredPoses = useMemo(() => {
    return POSES.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (difficultyFilter !== "all" && p.difficulty !== difficultyFilter) return false;
      return true;
    });
  }, [categoryFilter, difficultyFilter]);

  const addToFlow = useCallback((id: string) => {
    setFlowPoseIds((prev) => {
      if (prev.includes(id)) return prev;
      if (prev.length >= 7) return prev;
      return [...prev, id];
    });
  }, []);

  const removeFromFlow = useCallback((id: string) => {
    setFlowPoseIds((prev) => prev.filter((p) => p !== id));
  }, []);

  const drawCard = useCallback(() => {
    setIsFlipping(true);
    setTimeout(() => {
      const card = TRUTH_CARDS[Math.floor(Math.random() * TRUTH_CARDS.length)];
      setDrawnCard(card);
      setIsFlipping(false);
    }, 400);
  }, []);

  return (
    <div className="section-padding max-w-7xl mx-auto relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-brand-400 mb-4">
          <Flower2 className="w-4 h-4" /> Yoga Flows
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient mb-4">
          The Living Practice
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
          Explore authentic yoga postures, build your own flow sequences, and discover the connection
          between movement, breath, and the subtle energy body.
        </p>
      </motion.div>

      {/* Section Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {SECTION_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSection(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              section === tab.id
                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                : "glass text-gray-600 dark:text-gray-400 hover:text-brand-400"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* POSE LIBRARY */}
        {section === "poses" && (
          <motion.div
            key="poses"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="flex items-center gap-1 mr-4">
                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mr-1">Category</span>
                {(["all", ...Object.keys(CATEGORY_META)] as (Category | "all")[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      categoryFilter === cat
                        ? "bg-brand-500 text-white"
                        : "glass text-gray-600 dark:text-gray-400 hover:text-brand-400"
                    }`}
                  >
                    {cat === "all" ? "All" : CATEGORY_META[cat].label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mr-1">Level</span>
                {(["all", "beginner", "intermediate", "advanced"] as (Difficulty | "all")[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      difficultyFilter === diff
                        ? "bg-brand-500 text-white"
                        : "glass text-gray-600 dark:text-gray-400 hover:text-brand-400"
                    }`}
                  >
                    {diff === "all" ? "All" : diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Showing {filteredPoses.length} of {POSES.length} poses. Click any card to expand details.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredPoses.map((pose) => (
                  <PoseCard
                    key={pose.id}
                    pose={pose}
                    onAdd={() => addToFlow(pose.id)}
                    isInFlow={flowPoseIds.includes(pose.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* FLOW BUILDER */}
        {section === "flow-builder" && (
          <motion.div
            key="flow-builder"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="glass-card mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">Your Flow Sequence</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select 3 to 7 poses from the library to build a custom flow. Browse poses below or switch to the Pose Library tab to add.
                  </p>
                </div>
                {flowPoseIds.length > 0 && (
                  <button
                    onClick={() => setFlowPoseIds([])}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-sm text-gray-500 hover:text-rose-400 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                )}
              </div>

              {flowPoseIds.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Layers className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No poses selected yet. Add poses from the grid below.</p>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  {flowPoseIds.map((id, index) => {
                    const pose = getPoseById(id);
                    if (!pose) return null;
                    const meta = CATEGORY_META[pose.category];
                    return (
                      <motion.div
                        key={id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1"
                      >
                        <div className={`relative glass rounded-xl px-4 py-3 border-l-4 border-l-transparent bg-gradient-to-r ${meta.gradient} bg-clip-border`}
                          style={{ borderLeftColor: "currentColor" }}
                        >
                          <button
                            onClick={() => removeFromFlow(id)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs hover:bg-rose-600 transition-colors"
                            title="Remove from flow"
                            aria-label="Remove from flow"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <span className="text-xs text-brand-400 font-mono">{index + 1}</span>
                          <p className="font-display text-sm font-semibold text-gray-900 dark:text-white">{pose.english}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic">{pose.sanskrit}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{pose.holdTime}</p>
                        </div>
                        {index < flowPoseIds.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-brand-400/50 shrink-0" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {flowPoseIds.length > 0 && flowPoseIds.length < 3 && (
                <p className="text-xs text-amber-400 mt-3">Add at least {3 - flowPoseIds.length} more pose{3 - flowPoseIds.length > 1 ? "s" : ""} for a complete flow.</p>
              )}
              {flowPoseIds.length >= 3 && (
                <p className="text-xs text-emerald-400 mt-3">
                  Flow ready with {flowPoseIds.length} poses. Practice with intention and steady breath.
                </p>
              )}
            </div>

            <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Poses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {POSES.map((pose) => (
                <PoseCard
                  key={pose.id}
                  pose={pose}
                  onAdd={() => addToFlow(pose.id)}
                  isInFlow={flowPoseIds.includes(pose.id)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* MOOD FLOWS */}
        {section === "mood-flows" && (
          <motion.div
            key="mood-flows"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOOD_FLOWS.map((flow) => {
                const isExpanded = expandedMoodFlow === flow.name;
                return (
                  <motion.div
                    key={flow.name}
                    layout
                    className="glass-card overflow-hidden cursor-pointer"
                    onClick={() => setExpandedMoodFlow(isExpanded ? null : flow.name)}
                  >
                    <div className={`h-2 -mx-6 -mt-6 mb-4 bg-gradient-to-r ${flow.gradient}`} />
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${flow.gradient} flex items-center justify-center`}>
                        <flow.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-gray-900 dark:text-white">{flow.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{flow.poseIds.length} poses</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{flow.description}</p>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 border-t border-white/10 space-y-2">
                            <p className="text-xs text-brand-400 font-semibold uppercase tracking-wider">Sequence</p>
                            {flow.poseIds.map((id, i) => {
                              const pose = getPoseById(id);
                              if (!pose) return null;
                              return (
                                <div key={id} className="flex items-center gap-2 text-sm">
                                  <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 text-xs flex items-center justify-center font-mono">{i + 1}</span>
                                  <span className="text-gray-700 dark:text-gray-200">{pose.english}</span>
                                  <span className="text-gray-400 italic text-xs">({pose.sanskrit})</span>
                                </div>
                              );
                            })}
                            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/5">
                              <Timer className="w-3.5 h-3.5 text-gray-400" />
                              <p className="text-xs text-gray-500 dark:text-gray-400">{flow.timing}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFlowPoseIds(flow.poseIds);
                                setSection("flow-builder");
                              }}
                              className="mt-2 flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors"
                            >
                              <ChevronRight className="w-3 h-3" /> Open in Flow Builder
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* COLOR THERAPY */}
        {section === "color-therapy" && (
          <motion.div
            key="color-therapy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              Each color vibrates at a specific frequency that corresponds to one of the seven major chakras.
              Select a color to explore its healing properties and recommended poses.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {CHAKRA_COLORS.map((cc) => (
                <motion.button
                  key={cc.name}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveChakra(activeChakra?.name === cc.name ? null : cc)}
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${cc.color} transition-all shadow-lg ${
                    activeChakra?.name === cc.name ? "ring-4 ring-white/50 scale-110" : "opacity-80 hover:opacity-100"
                  }`}
                  title={`${cc.name} / ${cc.chakra} Chakra`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeChakra && (
                <motion.div
                  key={activeChakra.name}
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.97 }}
                  className="glass-card max-w-2xl mx-auto"
                >
                  <div className={`h-2 -mx-6 -mt-6 mb-6 bg-gradient-to-r ${activeChakra.gradient}`} />
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 rounded-full ${activeChakra.color} mx-auto mb-3 shadow-lg`} />
                    <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white">{activeChakra.chakra} Chakra</h3>
                    <p className="text-sm text-brand-400">{activeChakra.name} Spectrum</p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-center mb-4">{activeChakra.healing}</p>
                  <div className="glass rounded-xl p-4 mb-4 text-center">
                    <p className="text-xs text-brand-400 uppercase tracking-wider mb-1">Affirmation</p>
                    <p className="font-display text-lg text-gray-900 dark:text-white italic">"{activeChakra.affirmation}"</p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-400 uppercase tracking-wider mb-2">Recommended Poses</p>
                    <div className="flex flex-wrap gap-2">
                      {activeChakra.poseIds.map((id) => {
                        const pose = getPoseById(id);
                        if (!pose) return null;
                        return (
                          <span key={id} className="glass px-3 py-1.5 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                            {pose.english} <span className="text-gray-400 italic text-xs">({pose.sanskrit})</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!activeChakra && (
              <div className="text-center py-12 text-gray-400">
                <CircleDot className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Select a color above to explore its chakra connection.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* TRUTH CARDS */}
        {section === "truth-cards" && (
          <motion.div
            key="truth-cards"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center"
          >
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              Still the mind and draw a card. Whatever arrives is meant for this moment.
              There are {TRUTH_CARDS.length} cards in the deck.
            </p>

            <div className="relative w-72 h-96 mb-8" style={{ perspective: "1000px" }}>
              <motion.div
                animate={{ rotateY: isFlipping ? 180 : 0 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full relative"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Card Back */}
                <div
                  className="absolute inset-0 glass rounded-2xl flex flex-col items-center justify-center border-2 border-brand-500/30"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500/20 to-brand-700/20 flex items-center justify-center mb-4">
                    <Star className="w-12 h-12 text-brand-400" />
                  </div>
                  <p className="font-display text-lg text-brand-400">Draw a Truth</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click the button below</p>
                </div>

                {/* Card Front */}
                <div
                  className="absolute inset-0 glass rounded-2xl flex flex-col items-center justify-center p-8 border-2 border-brand-500/30"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  {drawnCard && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-center"
                    >
                      <Sparkles className="w-8 h-8 text-brand-400 mx-auto mb-4" />
                      <p className="font-display text-lg text-gray-900 dark:text-white leading-relaxed mb-4">
                        "{drawnCard.message}"
                      </p>
                      <p className="text-sm text-brand-400 italic">{drawnCard.source}</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={drawCard}
                className="btn-primary flex items-center gap-2"
              >
                <Shuffle className="w-4 h-4" />
                {drawnCard ? "Draw Another" : "Draw a Card"}
              </button>
              {drawnCard && (
                <button
                  onClick={() => { setDrawnCard(null); setIsFlipping(false); }}
                  className="btn-outline flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
