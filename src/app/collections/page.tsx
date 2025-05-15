import CollectionCard from '@/components/collections/CollectionCard';
import { mockCollections } from '@/data/mock-data';

export default function CollectionsPage() {
  return (
    <div className="py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold font-serif mb-2">Our Collections</h1>
        <p className="text-lg text-muted-foreground">Discover curated selections for every style and occasion.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockCollections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  );
}
