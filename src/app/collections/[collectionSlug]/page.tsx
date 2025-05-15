
'use client';
import { useParams } from 'next/navigation';
import ProductGrid from '@/components/product/ProductGrid';
import { mockCollections, mockProducts } from '@/data/mock-data';
import type { Collection, Product } from '@/types';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function CollectionDetailPage() {
  const params = useParams();
  const collectionSlug = params.collectionSlug as string;
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [baseProducts, setBaseProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]); // Default max, will adjust
  const [maxPossiblePrice, setMaxPossiblePrice] = useState(1000);
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-asc', 'price-desc', 'name-asc', 'name-desc'
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const foundCollection = mockCollections.find(c => c.slug === collectionSlug);
    if (foundCollection) {
      setCollection(foundCollection);
      const productsInCollection = mockProducts.filter(p => foundCollection.productIds.includes(p.id));
      setBaseProducts(productsInCollection);
      if (productsInCollection.length > 0) {
        const maxPrice = Math.max(...productsInCollection.map(p => p.price), 0);
        setMaxPossiblePrice(maxPrice > 0 ? maxPrice : 1000);
        setPriceRange([0, maxPrice > 0 ? maxPrice : 1000]);
      } else {
        setMaxPossiblePrice(1000);
        setPriceRange([0, 1000]);
      }
    } else {
      setCollection(null);
      setBaseProducts([]);
    }
  }, [collectionSlug]);

  const processedProducts = useMemo(() => {
    let tempProducts = [...baseProducts];

    // Search filter
    if (searchTerm) {
      tempProducts = tempProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Price range filter
    tempProducts = tempProducts.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        tempProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        tempProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        tempProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        tempProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'featured': // Assuming 'featured' products might be first or based on specific logic
      default:
        // Could add a specific 'featured' sorting if products have an order property
        tempProducts.sort((a,b) => (b.tags?.includes('featured') ? 1 : 0) - (a.tags?.includes('featured') ? 1 : 0) );
        break;
    }
    return tempProducts;
  }, [baseProducts, searchTerm, priceRange, sortBy]);

  useEffect(() => {
    setFilteredProducts(processedProducts);
  }, [processedProducts]);

  const FiltersContent = () => (
    <Card className="shadow-lg rounded-xl sticky top-24">
      <CardHeader>
        <CardTitle className="text-xl font-serif">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="search-collection" className="text-base font-medium">Search in Collection</Label>
          <Input
            id="search-collection"
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <h3 className="text-base font-medium mb-2">Price Range</h3>
          <Slider
            min={0}
            max={maxPossiblePrice}
            step={10}
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            className="mt-1"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>${priceRange[0]}</span>
            <span>${maxPossiblePrice > 0 ? priceRange[1] : 'N/A'}</span>
          </div>
        </div>
         <Button onClick={() => {
            setSearchTerm('');
            setPriceRange([0, maxPossiblePrice]);
            setSortBy('featured');
         }} variant="outline" className="w-full">
            Clear All Filters
        </Button>
      </CardContent>
    </Card>
  );

  if (!collection && baseProducts.length === 0) { // Check baseProducts as well to avoid flash of loading
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">Loading collection...</h1>
      </div>
    );
  }
  
  if (!collection) {
     return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold font-serif">Collection Not Found</h1>
        <p className="text-muted-foreground mt-2">The collection you are looking for does not exist.</p>
        <Link href="/collections" className="mt-4 inline-block">
            <Button>Back to Collections</Button>
        </Link>
      </div>
    );
  }


  return (
    <div className="py-8">
      <section className="relative h-[40vh] min-h-[300px] max-h-[500px] rounded-xl overflow-hidden shadow-lg mb-12">
        <Image
          src={collection.imageUrl}
          alt={collection.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1500px"
          style={{objectFit: "cover"}}
          className="brightness-75"
          data-ai-hint={collection.dataAiHint || 'fashion collection'}
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-8 bg-black/30">
          <h1 className="text-4xl md:text-6xl font-bold font-serif mb-3 !text-white">
            {collection.name}
          </h1>
          <p className="text-md md:text-lg max-w-xl !text-white/90">
            {collection.description}
          </p>
        </div>
      </section>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar - Desktop */}
        <aside className="hidden md:block md:w-1/4 lg:w-1/5 space-y-6">
          <FiltersContent />
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <p className="text-sm text-muted-foreground">{filteredProducts.length} products found</p>
            
            {/* Mobile Filter Trigger */}
            <div className="md:hidden">
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto p-0">
                   <div className="p-4 h-full"><FiltersContent/></div>
                </SheetContent>
              </Sheet>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} columns="3" />
          ) : (
            <p className="text-center text-muted-foreground py-12 text-lg">
              No products match your current filters in this collection. Try adjusting your search or filter criteria.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
