'use client';
import { useState, useEffect, useMemo } from 'react';
import ProductGrid from '@/components/product/ProductGrid';
import { mockProducts } from '@/data/mock-data';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const allCategories = Array.from(new Set(mockProducts.map(p => p.category).filter(Boolean))) as string[];
const maxPrice = Math.max(...mockProducts.map(p => p.price));

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [sortBy, setSortBy] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);


  const filteredAndSortedProducts = useMemo(() => {
    let tempProducts = [...mockProducts];

    // Search filter
    if (searchTerm) {
      tempProducts = tempProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      tempProducts = tempProducts.filter(p => p.category && selectedCategories.includes(p.category));
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
      // Add more sorting options like 'newest', 'rating' if data supports
      case 'featured':
      default:
        // No specific sort for featured, could be based on an order property or default
        break;
    }
    return tempProducts;
  }, [searchTerm, selectedCategories, priceRange, sortBy]);
  
  useEffect(() => {
    setProducts(filteredAndSortedProducts);
  }, [filteredAndSortedProducts]);


  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const FiltersContent = () => (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl font-serif">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="search" className="text-base font-medium">Search</Label>
          <Input
            id="search"
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <h3 className="text-base font-medium mb-2">Category</h3>
          <div className="space-y-2">
            {allCategories.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryChange(category)}
                />
                <Label htmlFor={`category-${category}`} className="font-normal">{category}</Label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-base font-medium mb-2">Price Range</h3>
          <Slider
            min={0}
            max={maxPrice}
            step={10}
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            className="mt-1"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
         <Button onClick={() => {
            setSearchTerm('');
            setSelectedCategories([]);
            setPriceRange([0, maxPrice]);
            setSortBy('featured');
         }} variant="outline" className="w-full">
            Clear All Filters
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold font-serif mb-2">All Products</h1>
        <p className="text-lg text-muted-foreground">Explore our curated selection of classic pieces.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar - Desktop */}
        <aside className="hidden md:block md:w-1/4 lg:w-1/5 space-y-6">
          <FiltersContent />
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <p className="text-sm text-muted-foreground">{products.length} products found</p>
            
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
          <ProductGrid products={products} columns="3" />
        </main>
      </div>
    </div>
  );
}
