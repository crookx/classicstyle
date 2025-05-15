import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold font-serif mb-4">About ClassicStyle</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Dedicated to bringing you timeless elegance and exceptional quality.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <Image 
            src="https://placehold.co/800x600.png" 
            alt="Artisan crafting a garment" 
            width={800} 
            height={600} 
            className="rounded-lg shadow-xl"
            data-ai-hint="artisan workshop" 
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-serif font-semibold">Our Philosophy</h2>
          <p className="text-lg text-foreground/80 leading-relaxed">
            At ClassicStyle, we believe in the enduring power of classic design. Our mission is to curate a collection of apparel and accessories that transcend fleeting trends, offering pieces that are both sophisticated and versatile. We partner with skilled artisans and reputable manufacturers who share our commitment to quality and ethical practices.
          </p>
          <p className="text-lg text-foreground/80 leading-relaxed">
            We meticulously select materials for their beauty, durability, and comfort, ensuring that every item in our store not only looks exquisite but also feels wonderful to wear. Our style is rooted in understated elegance, designed for the modern individual who appreciates fine craftsmanship and timeless appeal.
          </p>
        </div>
      </div>

      <div className="bg-muted/40 py-16 rounded-xl">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-serif font-semibold mb-8">Our Commitment</h2>
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 lucide lucide-gem"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M12 22V9"/><path d="M2 9h20"/></svg>
              <h3 className="text-xl font-serif font-semibold mb-2">Uncompromising Quality</h3>
              <p className="text-foreground/70">We source only the finest materials and partner with skilled artisans to ensure every piece meets our high standards.</p>
            </div>
            <div className="p-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 lucide lucide-leaf"><path d="M11 20A7 7 0 0 1 4 13H2a10 10 0 0 0 10 10zM2 13a10 10 0 0 1 10-10h1v1a7 7 0 0 0-7 7h-1z"/><path d="M12 22a10 10 0 0 0 10-10h-1a7 7 0 0 1-7 7v1z"/><path d="M22 12a10 10 0 0 1-10 10V11a7 7 0 0 0 7-7h1z"/></svg>
              <h3 className="text-xl font-serif font-semibold mb-2">Ethical &amp; Sustainable</h3>
              <p className="text-foreground/70">We are dedicated to responsible sourcing, ethical production,, and minimizing our environmental impact.</p>
            </div>
            <div className="p-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 lucide lucide-user-check"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
              <h3 className="text-xl font-serif font-semibold mb-2">Customer Focused</h3>
              <p className="text-foreground/70">Your satisfaction is our priority. We strive to provide an exceptional shopping experience from start to finish.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
