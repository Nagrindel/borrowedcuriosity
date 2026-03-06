import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import LegalLayout from "./layout";

export default function PrivacyPolicy() {
  return (
    <LegalLayout icon={Shield} title="Privacy Policy" updated="March 5, 2026">
      <Section title="1. Information We Collect">
        <p>
          Borrowed Curiosity LLC ("we," "us," or "our") collects only the information necessary
          to provide our services. This includes:
        </p>
        <ul>
          <li><strong>Email address</strong> when you subscribe to our blog or newsletter.</li>
          <li><strong>Name and order details</strong> when you make a purchase through our store.</li>
          <li><strong>Numerology inputs</strong> (name, birth date) that you voluntarily enter into our calculators. These are processed client-side or stored locally and are not shared with third parties.</li>
          <li><strong>Chat messages</strong> sent to Alta, our AI assistant, which are processed through a third-party AI service (Groq) to generate responses. We do not store chat transcripts long-term.</li>
          <li><strong>Comments</strong> you post on blog articles, courses, or gallery items, including the display name you provide.</li>
          <li><strong>Usage data</strong> such as pages visited, time spent, and general analytics collected through standard web technologies.</li>
        </ul>
      </Section>

      <Section title="2. How We Use Your Information">
        <ul>
          <li>To process and fulfill orders from our store.</li>
          <li>To send newsletters and blog updates (only if you subscribed).</li>
          <li>To provide numerology calculations, daily guidance, and AI-assisted responses.</li>
          <li>To improve our website, tools, and user experience.</li>
          <li>To display relevant advertisements on our blog.</li>
        </ul>
      </Section>

      <Section title="3. Third-Party Services">
        <p>We use the following third-party services:</p>
        <ul>
          <li><strong>Groq API</strong> for powering Alta AI chat responses.</li>
          <li><strong>Dictionary API</strong> (dictionaryapi.dev) for word lookup definitions.</li>
          <li><strong>Payment processors</strong> for handling store transactions securely. We never store your full payment card details.</li>
          <li><strong>Hosting providers</strong> for serving the website and storing data.</li>
        </ul>
        <p>
          Each third-party service has its own privacy policy. We encourage you to review them.
        </p>
      </Section>

      <Section title="4. Cookies and Tracking">
        <p>
          We use minimal cookies for essential functionality such as theme preference (dark/light mode)
          and admin authentication. We may use analytics cookies to understand site usage patterns.
          You can disable cookies in your browser settings at any time.
        </p>
      </Section>

      <Section title="5. Data Storage and Security">
        <p>
          Your data is stored on secure servers. Numerology calculations performed client-side
          never leave your browser unless you explicitly save a profile. We implement reasonable
          security measures to protect your information but cannot guarantee absolute security.
        </p>
      </Section>

      <Section title="6. Your Rights">
        <p>You have the right to:</p>
        <ul>
          <li>Request access to the personal data we hold about you.</li>
          <li>Request deletion of your data.</li>
          <li>Unsubscribe from emails at any time using the link in any email we send.</li>
          <li>Opt out of non-essential cookies.</li>
        </ul>
      </Section>

      <Section title="7. Children's Privacy">
        <p>
          Our services are not directed at children under 13. We do not knowingly collect
          personal information from children. If you believe a child has provided us with
          personal data, please contact us so we can delete it.
        </p>
      </Section>

      <Section title="8. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted on this page
          with an updated revision date. Continued use of our site after changes constitutes
          acceptance of the updated policy.
        </p>
      </Section>

      <Section title="9. Contact">
        <p>
          For privacy-related questions or data requests, contact Borrowed Curiosity LLC
          through the contact methods available on our website.
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
