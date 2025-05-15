import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
            
            <h3 className="text-xl font-semibold font-serif pt-4">Domestic Shipping (USA)</h3>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><strong>Standard Shipping:</strong> 5-7 business days. Free on orders over $100, otherwise $7.95.</li>
              <li><strong>Expedited Shipping:</strong> 2-3 business days. $15.95.</li>
              <li><strong>Express Shipping:</strong> 1-2 business days. $25.95.</li>
            </ul>

            <h3 className="text-xl font-semibold font-serif pt-4">International Shipping</h3>
            <p>We ship to most countries worldwide. Shipping costs and delivery times vary by destination and will be calculated at checkout. Please note that international orders may be subject to customs duties, taxes, and fees levied by the destination country. These charges are the responsibility of the recipient.</p>
          
            <h3 className="text-xl font-semibold font-serif pt-4">Order Tracking</h3>
            <p>Once your order ships, you'll receive an email with a tracking number. You can use this number on the carrier's website to monitor your package's progress.</p>
          </CardContent>
        </Card>

        <Separator />

        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-serif">Return Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/80 leading-relaxed">
            <p>We want you to be completely satisfied with your purchase. If for any reason you are not, we accept returns on eligible items within <strong>30 days</strong> of the delivery date.</p>
            
            <h3 className="text-xl font-semibold font-serif pt-4">Eligibility for Returns</h3>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>Items must be unworn, unwashed, and in their original condition.</li>
              <li>All original tags must be attached.</li>
              <li>Final sale items, custom orders, and certain accessories (e.g., earrings for hygiene reasons) are not eligible for return.</li>
            </ul>

            <h3 className="text-xl font-semibold font-serif pt-4">How to Make a Return</h3>
            <ol className="list-decimal list-inside space-y-2 pl-4">
              <li>Visit our online <a href="/contact" className="text-primary hover:underline">Returns Portal</a> or contact our customer service team at <a href="mailto:support@classicstyle.com" className="text-primary hover:underline">support@classicstyle.com</a> with your order number and reason for return.</li>
              <li>Once your return is approved, you will receive a prepaid shipping label (for domestic orders) and instructions.</li>
              <li>Package your item(s) securely and attach the shipping label.</li>
              <li>Drop off the package at the designated carrier location.</li>
            </ol>

            <h3 className="text-xl font-semibold font-serif pt-4">Refunds</h3>
            <p>Once we receive and inspect your return, we will process your refund to the original payment method within 5-7 business days. Shipping charges are non-refundable unless the return is due to our error (e.g., wrong item sent, defective product).</p>
          
            <h3 className="text-xl font-semibold font-serif pt-4">Exchanges</h3>
            <p>Currently, we do not offer direct exchanges. If you wish to exchange an item, please return the original item for a refund and place a new order for the desired item.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
