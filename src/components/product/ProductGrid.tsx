import type { Product } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  columns?: '2' | '3' | '4';
}

export default function ProductGrid({ products, columns = '4' }: ProductGridProps) {
  if (!products || products.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No products found.</p>;
  }
  const gridClasses = {
    '2': 'grid-cols-1 sm:grid-cols-2',
    '3': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    '4': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-6 lg:gap-8`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
