'use client';
import { useParams } from 'next/navigation';
import ProductGrid from '@/components/product/ProductGrid';
import { mockCollections, mockProducts } from '@/data/mock-data';
import type { Collection, Product } from '@/types';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function CollectionDetailPage() {
  const params = useParams();
  const collectionSlug = params.collectionSlug as string;
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [collectionProducts, setCollectionProducts] = useState<Product[]>([]);

  useEffect(() => {
    const foundCollection = mockCollections.find(c => c.slug === collectionSlug);
    if (foundCollection) {
      setCollection(foundCollection);
      const products = mockProducts.filter(p => foundCollection.productIds.includes(p.id));
      setCollectionProducts(products);
    }
  }, [collectionSlug]);


  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">Loading collection...</h1>
      </div>
    );
  }

  return (
    <div className="py-8">
      <section className="relative h-[40vh] min-h-[300px] max-h-[500px] rounded-xl overflow-hidden shadow-lg mb-12">
        <Image
          src={collection.imageUrl}
          alt={collection.name}
          layout="fill"
          objectFit="cover"
          className="brightness-75"
          data-ai-hint={collection.dataAiHint || 'fashion collection'}
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
      
      {collectionProducts.length > 0 ? (
        <ProductGrid products={collectionProducts} />
      ) : (
        <p className="text-center text-muted-foreground py-8">No products found in this collection yet.</p>
      )}
    </div>
  );
}
