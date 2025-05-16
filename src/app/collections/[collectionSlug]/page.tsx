
'use client'; // Client component for filtering and state

import { useParams, notFound } from 'next/navigation';
import ProductGrid from '@/components/product/ProductGrid';
import { getCollectionBySlug, getProductsByIds } from '@/lib/firebase/firestoreService';
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
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

export default function CollectionDetailPage() {
  const params = useParams();
  const collectionSlug = params.collectionSlug as string;
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [baseProducts, setBaseProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [maxPossiblePrice, setMaxPossiblePrice] = useState(500);
  const [sortBy, setSortBy] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    async function loadCollectionData() {
      if (!collectionSlug) return;
      setIsLoading(true);
      const foundCollection = await getCollectionBySlug(collectionSlug);
      
      if (foundCollection) {
        setCollection(foundCollection);
        if (foundCollection.productIds && foundCollection.productIds.length > 0) {
          const productsInCollection = await getProductsByIds(foundCollection.productIds);
          setBaseProducts(productsInCollection);
          if (productsInCollection.length > 0) {
            const maxPrice = Math.max(...productsInCollection.map(p => p.price), 0);
            setMaxPossiblePrice(maxPrice > 0 ? maxPrice : 500);
            setPriceRange([0, maxPrice > 0 ? maxPrice : 500]);
          } else {
            setMaxPossiblePrice(500); // Default if no products
            setPriceRange([0, 500]);
          }
        } else {
          setBaseProducts([]);
          setMaxPossiblePrice(500);
          setPriceRange([0, 500]);
        }
      } else {
        setCollection(null); // Consider redirecting or showing not found
        setBaseProducts([]);
      }
      setIsLoading(false);
    }
    loadCollectionData();
  }, [collectionSlug]);

  const processedProducts = useMemo(() => {
    let tempProducts = [...baseProducts];

    if (searchTerm) {
      tempProducts = tempProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    tempProducts = tempProducts.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'price-asc': tempProducts.sort((a, b) => a.price - b.price); break;
      case 'price-desc': tempProducts.sort((a, b) => b.price - a.price); break;
      case 'name-asc': tempProducts.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': tempProducts.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'featured': default: tempProducts.sort((a,b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) ); break;
    }
    return tempProducts;
  }, [baseProducts, searchTerm, priceRange, sortBy]);

  useEffect(() => {
    setFilteredProducts(processedProducts);
  }, [processedProducts]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setPriceRange([0, maxPossiblePrice]);
    setSortBy('featured');
  };

  const FiltersContent = () => (
    <Card className="shadow-lg rounded-xl border-none">
      <CardContent className="space-y-6 pt-6">
        <div>
          <Label htmlFor="search-collection-filter" className="text-base font-medium">Search in Collection</Label>
          <Input
            id="search-collection-filter"
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
            step={1}
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            className="mt-1"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>${priceRange[0]}</span>
            <span>${maxPossiblePrice > 0 ? priceRange[1] : 'N/A'}</span>
          </div>
        </div>
         <Button onClick={clearAllFilters} variant="outline" className="w-full">
            Clear All Filters
        </Button>
      </CardContent>
    </Card>
  );
  
  if (isLoading) {
    return (
      <div className="py-8">
        <Skeleton className="h-[40vh] min-h-[300px] max-h-[500px] rounded-xl mb-12" />
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="hidden md:block md:w-1/4 lg:w-1/5 space-y-6">
             <Card className="shadow-lg rounded-xl sticky top-24">
              <CardHeader><Skeleton className="h-6 w-20" /></CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </aside>
          <main className="flex-1 space-y-6">
            <Skeleton className="h-8 w-1/4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_,i) => <Card key={i}><CardContent className="p-4"><Skeleton className="aspect-[4/5] w-full"/></CardContent></Card>)}
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  if (!collection && !isLoading) {
     return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold font-serif">Collection Not Found</h1>
        <p className="text-muted-foreground mt-2">The collection you are looking for does not exist or could not be loaded.</p>
        <Link href="/collections" className="mt-4 inline-block">
            <Button>Back to Collections</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      {collection && (
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
      )}
      
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="hidden md:block md:w-1/4 lg:w-1/5 space-y-6">
          <Card className="shadow-lg rounded-xl sticky top-24">
             <CardHeader>
                <CardTitle className="text-xl font-serif">Filters</CardTitle>
            </CardHeader>
            <FiltersContent />
          </Card>
        </aside>

        <main className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <p className="text-sm text-muted-foreground">{filteredProducts.length} products found</p>
            
            <div className="md:hidden">
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
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
              No products match your current filters in this collection.
            </p>
          )}
           {baseProducts.length === 0 && !isLoading && (
             <p className="text-center text-muted-foreground py-12 text-lg">
              There are currently no products in this collection.
            </p>
           )}
        </main>
      </div>
    </div>
  );
}
