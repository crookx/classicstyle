import Image from 'next/image';
import Link from 'next/link';
import type { Collection } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CollectionCardProps {
  collection: Collection;
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link href={`/collections/${collection.slug}`} className="block group">
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
        <CardHeader className="p-0 relative">
          <div className="aspect-video overflow-hidden">
            <Image
              src={collection.imageUrl}
              alt={collection.name}
              width={800}
              height={400}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={collection.dataAiHint}
            />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <CardTitle className="text-xl font-serif font-medium group-hover:text-primary transition-colors">
            {collection.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {collection.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
