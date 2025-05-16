
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link"; // Import Link

export default function ShippingReturnsPage() {
  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold font-serif mb-4">Shipping &amp; Returns</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Information about our shipping policies and how to make a return.
        </p>
      </div>

      <div className="space-y-12 max-w-3xl mx-auto">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-serif">Shipping Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/80 leading-relaxed">
            <p>We strive to process and ship all orders within 1-2 business days. You will receive a shipping confirmation email with tracking information once your order is on its way.</p>
            
            <h3 className="text-xl font-semibold font-serif pt-4">Domestic Shipping (Kenya)</h3>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><strong>Standard Shipping:</strong> 2-5 business days. Free on orders over KSh 5,000, otherwise KSh 350.</li>
              <li><strong>Express Shipping:</strong> 1-2 business days (Nairobi &amp; environs). KSh 500.</li>
            </ul>

            <h3 className="text-xl font-semibold font-serif pt-4">International Shipping</h3>
            <p>Currently, we primarily ship within Kenya. Please contact us for international shipping inquiries before placing an order.</p>
          
            <h3 className="text-xl font-semibold font-serif pt-4">Order Tracking</h3>
            <p>Once your order ships, you'll receive an email with a tracking number (if applicable for the chosen shipping method). You can use this number on the carrier's website to monitor your package's progress.</p>
          </CardContent>
        </Card>

        <Separator />

        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-serif">Return Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/80 leading-relaxed">
            <p>We want you to be completely satisfied with your purchase. If for any reason you are not, we accept returns on eligible items within <strong>14 days</strong> of the delivery date.</p>
            
            <h3 className="text-xl font-semibold font-serif pt-4">Eligibility for Returns</h3>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>Items must be unworn, unwashed, and in their original condition with all tags attached.</li>
              <li>Items must be in their original packaging.</li>
              <li>Final sale items, custom orders, and certain accessories (e.g., earrings for hygiene reasons) are not eligible for return.</li>
            </ul>

            <h3 className="text-xl font-semibold font-serif pt-4">How to Make a Return</h3>
            <ol className="list-decimal list-inside space-y-2 pl-4">
              <li>
                Contact our customer service team at <Link href="mailto:support@classicstyle.com" className="text-primary hover:underline">support@classicstyle.com</Link> or call us at <Link href="tel:+254700000000" className="text-primary hover:underline">+254 7XX XXX XXX</Link> with your order number and reason for return.
              </li>
              <li>Once your return is approved, you will receive instructions on how to send back the item(s). Return shipping costs are typically borne by the customer unless the return is due to our error.</li>
              <li>Package your item(s) securely.</li>
            </ol>

            <h3 className="text-xl font-semibold font-serif pt-4">Refunds &amp; Exchanges</h3>
            <p>Once we receive and inspect your return, we will process your refund to the original payment method (or offer store credit) within 5-7 business days. Original shipping charges are non-refundable.</p>
            <p>For exchanges, please return the original item for a refund/credit and place a new order for the desired item. This ensures the new item is in stock and dispatched promptly.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
