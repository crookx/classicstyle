
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold font-serif mb-4">Terms of Service</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Please read these terms carefully before using our services.
        </p>
      </div>

      <Card className="max-w-3xl mx-auto shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-serif">ClassicStyle eStore Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground/80 leading-relaxed prose">
          <p><strong>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>

          <p>Welcome to ClassicStyle eStore! These Terms of Service (&quot;Terms&quot;) govern your use of our website, products, and services (collectively, the &quot;Services&quot;). By accessing or using our Services, you agree to be bound by these Terms.</p>

          <h2>1. Use of Our Services</h2>
          <p>You may use our Services only if you can form a binding contract with ClassicStyle eStore, and only in compliance with these Terms and all applicable laws. When you create your ClassicStyle eStore account, you must provide us with accurate and complete information.</p>

          <h2>2. Products and Orders</h2>
          <p>All purchases through our site or other transactions for the sale of goods formed through the website are governed by our Sale Policy, which is hereby incorporated into these Terms of Service. We reserve the right to refuse or cancel any order for any reason, including limitations on quantities available for purchase, inaccuracies, or errors in product or pricing information, or problems identified by our credit and fraud avoidance department.</p>

          <h2>3. Intellectual Property</h2>
          <p>The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of ClassicStyle eStore and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of ClassicStyle eStore.</p>

          <h2>4. User Accounts</h2>
          <p>When you create an account with us, you guarantee that you are above the age of 18 and that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on our Service.</p>
          <p>You are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password.</p>

          <h2>5. Limitation of Liability</h2>
          <p>In no event shall ClassicStyle eStore, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

          <h2>6. Changes to Terms</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>

          <h2>7. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at support@classicstyle.com.</p>

          <p><em>This is a generic template. Consult with a legal professional to ensure your Terms of Service are appropriate for your specific business and jurisdiction.</em></p>
        </CardContent>
      </Card>
    </div>
  );
}
