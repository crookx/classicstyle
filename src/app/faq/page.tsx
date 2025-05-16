
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"; // Added missing import

const faqs = [
  {
    question: "What are your shipping options?",
    answer: "We offer standard, expedited, and express shipping options. Standard shipping typically takes 5-7 business days, expedited 2-3 business days, and express 1-2 business days. Shipping costs and availability vary by location."
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns on unworn, unwashed items with tags attached within 30 days of purchase. Please visit our Shipping & Returns page for detailed instructions on how to initiate a return."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order has shipped, you will receive an email confirmation with a tracking number. You can use this number on the carrier's website to track your package."
  },
  {
    question: "Do you offer international shipping?",
    answer: "Yes, we ship to many countries worldwide. International shipping rates and times vary. Please proceed to checkout to see if we ship to your location and to get an estimate."
  },
  {
    question: "How do I care for my garments?",
    answer: "Care instructions are provided on the product page and on the garment's label. For delicate items like silk or cashmere, we generally recommend hand washing or dry cleaning to maintain their quality."
  },
  {
    question: "Can I change or cancel my order after it's been placed?",
    answer: "We process orders quickly, but we'll do our best to accommodate your request. Please contact our customer service team as soon as possible with your order number. If the order has not yet been processed for shipping, we may be able to make changes or cancel it."
  },
];

export default function FAQPage() {
  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold font-serif mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions about our products, shipping, returns, and more.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index + 1}`} key={index} className="bg-card border border-border rounded-lg shadow-sm px-6">
              <AccordionTrigger className="text-lg font-medium text-left hover:no-underline py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-foreground/80 pb-4 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-serif font-semibold mb-4">Can't find what you're looking for?</h2>
        <p className="text-muted-foreground mb-6">Our customer support team is here to help. Please don't hesitate to reach out.</p>
        <a href="/contact">
          <Button size="lg">Contact Support</Button>
        </a>
      </div>
    </div>
  );
}
