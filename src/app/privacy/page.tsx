
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold font-serif mb-4">Privacy Policy</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your privacy is important to us.
        </p>
      </div>

      <Card className="max-w-3xl mx-auto shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-serif">ClassicStyle eStore Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground/80 leading-relaxed prose">
          <p><strong>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>

          <p>ClassicStyle eStore (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;) operates the ClassicStyle eStore website (the &quot;Service&quot;). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>

          <h2>1. Information Collection and Use</h2>
          <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
          <h3>Types of Data Collected</h3>
          <h4>Personal Data</h4>
          <p>While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you (&quot;Personal Data&quot;). Personally identifiable information may include, but is not limited to:</p>
          <ul>
            <li>Email address</li>
            <li>First name and last name</li>
            <li>Phone number</li>
            <li>Address, State, Province, ZIP/Postal code, City</li>
            <li>Cookies and Usage Data</li>
          </ul>
          <h4>Usage Data</h4>
          <p>We may also collect information on how the Service is accessed and used (&quot;Usage Data&quot;). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>

          <h2>2. Use of Data</h2>
          <p>ClassicStyle eStore uses the collected data for various purposes:</p>
          <ul>
            <li>To provide and maintain our Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information so that we can improve our Service</li>
            <li>To monitor the usage of our Service</li>
            <li>To detect, prevent and address technical issues</li>
            <li>To provide you with news, special offers and general information about other goods, services and events which we offer that are similar to those that you have already purchased or enquired about unless you have opted not to receive such information</li>
          </ul>

          <h2>3. Data Security</h2>
          <p>The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>

          <h2>4. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the &quot;effective date&quot; at the top of this Privacy Policy.</p>

          <h2>5. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at support@classicstyle.com.</p>

          <p><em>This is a generic template. Consult with a legal professional to ensure your Privacy Policy is appropriate for your specific business, data handling practices, and jurisdiction (e.g., GDPR, CCPA compliance).</em></p>
        </CardContent>
      </Card>
    </div>
  );
}
