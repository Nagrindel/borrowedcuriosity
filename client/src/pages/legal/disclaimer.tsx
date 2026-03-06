import { AlertTriangle } from "lucide-react";
import LegalLayout from "./layout";

export default function Disclaimer() {
  return (
    <LegalLayout icon={AlertTriangle} title="Disclaimer" updated="March 5, 2026">
      <Section title="1. General Information">
        <p>
          The content on the Borrowed Curiosity website is provided for informational,
          educational, and entertainment purposes only. Nothing on this website should be
          construed as professional advice of any kind, including but not limited to medical,
          psychological, legal, financial, or therapeutic advice.
        </p>
      </Section>

      <Section title="2. Numerology and Spiritual Content">
        <p>
          Numerology, crystal healing, gematria, and related spiritual practices are based on
          traditional belief systems and are not scientifically proven. The interpretations,
          readings, and guidance provided through our calculators, courses, blog posts, and
          AI assistant (Alta) are for self-discovery and entertainment purposes.
        </p>
        <p>
          <strong>They are not a substitute for professional counseling, medical treatment,
          or evidence-based therapy.</strong> If you are experiencing a mental health crisis
          or medical emergency, please contact a qualified professional or emergency services.
        </p>
      </Section>

      <Section title="3. AI Assistant (Alta)">
        <p>
          Alta is powered by artificial intelligence. While we have designed Alta to be
          knowledgeable about numerology and related topics, Alta's responses are generated
          by a language model and may occasionally contain inaccuracies. Alta does not have
          access to your personal records or history beyond what you share in the current
          conversation.
        </p>
        <p>
          Alta's guidance should not be used as the sole basis for important life decisions.
          Always use your own judgment and consult qualified professionals when needed.
        </p>
      </Section>

      <Section title="4. Product Claims">
        <p>
          Our handcrafted products (salves, jewelry, crystals) are made with care and natural
          ingredients. However:
        </p>
        <ul>
          <li>Salves and topical products are not FDA-approved medications and are not intended to diagnose, treat, cure, or prevent any disease.</li>
          <li>Crystal and gemstone properties described on our site are based on traditional beliefs and are not scientifically verified.</li>
          <li>If you have allergies or sensitivities, review product ingredients carefully before use.</li>
          <li>Discontinue use and consult a healthcare provider if irritation occurs.</li>
        </ul>
      </Section>

      <Section title="5. External Links">
        <p>
          Our website may contain links to external websites. We are not responsible for the
          content, accuracy, or privacy practices of third-party sites. Accessing external
          links is at your own risk.
        </p>
      </Section>

      <Section title="6. Accuracy of Information">
        <p>
          We make reasonable efforts to ensure the accuracy of information on our website,
          but we do not warrant that all content is error-free, complete, or current. Blog
          posts, course content, and tool outputs may contain opinions, approximations, or
          interpretations that differ from other sources.
        </p>
      </Section>

      <Section title="7. User-Generated Content">
        <p>
          Comments and content posted by users on our blog, courses, and gallery do not
          represent the views of Borrowed Curiosity LLC. We are not responsible for
          user-generated content but reserve the right to moderate it.
        </p>
      </Section>

      <Section title="8. Limitation of Liability">
        <p>
          To the fullest extent permitted by law, Borrowed Curiosity LLC disclaims all
          liability for any damages resulting from the use of our website, tools, products,
          or services. This includes direct, indirect, incidental, consequential, and
          punitive damages.
        </p>
      </Section>

      <Section title="9. Changes">
        <p>
          This disclaimer may be updated at any time. The version posted on this page is
          the current and binding version.
        </p>
      </Section>
    </LegalLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold mb-3">{title}</h2>
      <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:leading-relaxed">
        {children}
      </div>
    </div>
  );
}
