
'use client'; // This page involves client-side filtering and state management

import { useState, useEffect, useMemo } from 'react';
import ProductGrid from '@/components/product/ProductGrid';
import { getProducts as fetchProductsFromDB } from '@/lib/firebase/firestoreService'; // Renamed import
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import type { Metadata } from 'next';

// Basic metadata for SEO - this will be static for this page.
// For dynamic metadata on product pages, use generateMetadata.
// export const metadata: Metadata = {
//   title: 'All Products - ClassicStyle eStore',
//   description: 'Explore our curated selection of classic pieces. Shop for men, women, and kids.',
// };
// ^ Metadata cannot be exported from client components. It should be in layout.tsx or page.tsx if it's a server component.

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]); // Increased default max for KES
  const [maxPossiblePrice, setMaxPossiblePrice] = useState(50000);
  const [sortBy, setSortBy] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [allAvailableCategories, setAllAvailableCategories] = useState<string[]>([]);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      const productsFromDB = await fetchProductsFromDB();
      setAllProducts(productsFromDB);
      setFilteredProducts(productsFromDB);

      if (productsFromDB.length > 0) {
        const categories = Array.from(new Set(productsFromDB.map(p => p.category).filter(Boolean))) as string[];
        setAllAvailableCategories(categories);

        const maxPriceFromData = Math.max(...productsFromDB.map(p => p.price), 0);
        const effectiveMaxPrice = maxPriceFromData > 0 ? maxPriceFromData : 50000;
        setMaxPossiblePrice(effectiveMaxPrice);
        setPriceRange([0, effectiveMaxPrice]);
      }
      setIsLoading(false);
    }
    loadProducts();
  }, []);

  const processedProducts = useMemo(() => {
    let tempProducts = [...allProducts];

    if (searchTerm) {
      tempProducts = tempProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategories.length > 0) {
      tempProducts = tempProducts.filter(p => p.category && selectedCategories.includes(p.category));
    }

    tempProducts = tempProducts.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

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
      case 'featured':
      default:
        tempProducts.sort((a,b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) );
        break;
    }
    return tempProducts;
  }, [allProducts, searchTerm, selectedCategories, priceRange, sortBy]);

  useEffect(() => {
    setFilteredProducts(processedProducts);
  }, [processedProducts]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setPriceRange([0, maxPossiblePrice]);
    setSortBy('featured');
  };

  const FiltersContent = () => (
    <Card className="shadow-lg rounded-xl border-none">
      <CardContent className="space-y-6 pt-6">
        <div>
          <Label htmlFor="search-filter" className="text-base font-medium">Search</Label>
          <Input
            id="search-filter"
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1"
          />
        </div>
        {allAvailableCategories.length > 0 && (
          <div>
            <h3 className="text-base font-medium mb-2">Category</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allAvailableCategories.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-filter-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <Label htmlFor={`category-filter-${category}`} className="font-normal">{category}</Label>
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <h3 className="text-base font-medium mb-2">Price Range (KSh)</h3>
          <Slider
            min={0}
            max={maxPossiblePrice}
            step={100} // More granular for KES-like values
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            className="mt-1"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>KSh {priceRange[0]}</span>
            <span>KSh {priceRange[1]}</span>
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
        <div className="mb-10 text-center">
          <Skeleton className="h-10 w-1/2 mx-auto mb-2" />
          <Skeleton className="h-6 w-3/4 mx-auto" />
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="hidden md:block md:w-1/4 lg:w-1/5 space-y-6">
            <Card className="shadow-lg rounded-xl sticky top-24">
              <CardHeader><Skeleton className="h-6 w-20" /></CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </aside>
          <main className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i}><CardContent className="p-4"><Skeleton className="aspect-[4/5] w-full" /></CardContent></Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }


  return (
    <div className="py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold font-serif mb-2">All Products</h1>
        <p className="text-lg text-muted-foreground">Explore our curated selection of classic pieces.</p>
      </div>

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
          <ProductGrid products={filteredProducts} columns="3" />
          {filteredProducts.length === 0 && !isLoading && (
            <p className="text-center py-10 text-muted-foreground">No products match your current filters.</p>
          )}
        </main>
      </div>
    </div>
  );
}
