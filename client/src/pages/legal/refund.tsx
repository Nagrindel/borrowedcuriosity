import { RotateCcw } from "lucide-react";
import LegalLayout from "./layout";

export default function RefundPolicy() {
  return (
    <LegalLayout icon={RotateCcw} title="Refund Policy" updated="March 5, 2026">
      <Section title="1. Overview">
        <p>
          At Borrowed Curiosity LLC, we stand behind the quality of our handcrafted products.
          If you're not satisfied with your purchase, we want to make it right. This policy
          outlines your options for returns and refunds.
        </p>
      </Section>

      <Section title="2. Physical Products (Salves, Jewelry)">
        <ul>
          <li><strong>Return window:</strong> 30 days from the date of delivery.</li>
          <li><strong>Condition:</strong> Items must be unused, in their original packaging, and in the same condition you received them.</li>
          <li><strong>Damaged or defective items:</strong> If your item arrives damaged or defective, contact us within 7 days of delivery. We will send a replacement or issue a full refund at no additional cost.</li>
          <li><strong>Return shipping:</strong> The buyer is responsible for return shipping costs unless the item arrived damaged or defective.</li>
          <li><strong>Refund processing:</strong> Refunds are processed within 7-10 business days after we receive the returned item. The refund will be issued to your original payment method.</li>
        </ul>
      </Section>

      <Section title="3. Numerology Reports">
        <p>
          Because written numerology reports are personalized services created specifically for you:
        </p>
        <ul>
          <li>Reports that have <strong>not yet been started</strong> may be cancelled for a full refund.</li>
          <li>Reports that are <strong>in progress or completed</strong> are non-refundable, as they represent time and expertise already invested.</li>
          <li>If you find an error in the calculations or content of your report, contact us and we will correct it at no charge.</li>
        </ul>
      </Section>

      <Section title="4. Digital Products and Courses">
        <p>
          All courses on Borrowed Curiosity are currently free. If we introduce paid digital
          products in the future, this section will be updated with applicable refund terms.
        </p>
      </Section>

      <Section title="5. Free Tools and Services">
        <p>
          Our free numerology tools (calculator, compatibility checker, daily numerology, gematria,
          word lookup, crystal guide, and Alta AI) are provided at no cost. No refund applies
          to free services.
        </p>
      </Section>

      <Section title="6. How to Request a Refund">
        <p>To initiate a return or refund request:</p>
        <ul>
          <li>Contact us through the methods available on our website.</li>
          <li>Include your order number, the item(s) you'd like to return, and the reason.</li>
          <li>We will respond within 2-3 business days with instructions.</li>
        </ul>
      </Section>

      <Section title="7. Exceptions">
        <p>The following items are non-refundable:</p>
        <ul>
          <li>Gift cards or promotional credits.</li>
          <li>Items purchased during final sale or clearance events (if applicable).</li>
          <li>Items that show signs of use, wear, or alteration.</li>
        </ul>
      </Section>

      <Section title="8. Changes to This Policy">
        <p>
          We reserve the right to update this Refund Policy at any time. Changes will be
          reflected on this page with an updated date. The policy in effect at the time
          of your purchase applies to that transaction.
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
