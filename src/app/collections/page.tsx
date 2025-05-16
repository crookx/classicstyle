
import CollectionCard from '@/components/collections/CollectionCard';
import { getCollections } from '@/lib/firebase/firestoreService';
import type { Collection } from '@/types';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state (though this is a server component)

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
        <p className="text-center text-muted-foreground py-8">No collections available at the moment. Please check back soon!</p>
      )}
    </div>
  );
}
