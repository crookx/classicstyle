
import CollectionCard from '@/components/collections/CollectionCard';
import { getCollections } from '@/lib/firebase/firestoreService';
import type { Collection } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Collections - ClassicStyle eStore',
  description: 'Discover curated collections for every style and occasion. Shop Men\'s, Women\'s, Kids\', and more.',
};

export default async function CollectionsPage() {
  const collections: Collection[] = await getCollections();

  return (
    <div className="py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold font-serif mb-2">Our Collections</h1>
        <p className="text-lg text-muted-foreground">Discover curated selections for every style and occasion.</p>
      </div>
      {collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">Loading collections or no collections available.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-[200px] w-full rounded-lg" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
