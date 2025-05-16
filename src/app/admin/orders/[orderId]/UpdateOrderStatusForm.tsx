
'use client';

import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateOrderStatusAction } from '@/lib/actions/orderActions';
import type { OrderStatus } from '@/types';
import { Loader2 } from 'lucide-react';

interface UpdateOrderStatusFormProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusUpdateSuccess?: (newStatus: OrderStatus) => void;
}

const availableStatuses: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function UpdateOrderStatusForm({ orderId, currentStatus, onStatusUpdateSuccess }: UpdateOrderStatusFormProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedStatus === currentStatus) {
        toast({
            title: 'No Change',
            description: 'The new status is the same as the current status.',
            variant: 'default'
        });
        return;
    }
    startTransition(async () => {
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('status', selectedStatus);

      const result = await updateOrderStatusAction(formData);
      if (result.success && result.newStatus) {
        toast({
          title: 'Order Status Updated',
          description: `Order ${result.orderId} status changed to ${result.newStatus}.`,
        });
        if (onStatusUpdateSuccess) {
          onStatusUpdateSuccess(result.newStatus);
        }
        // The page should revalidate due to revalidatePath in the server action.
      } else {
        toast({
          title: 'Error Updating Status',
          description: result.error || 'An unexpected error occurred.',
          variant: 'destructive',
        });
        console.error("Error updating status from form:", result);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="orderStatus" className="mb-2 block">New Status</Label>
        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as OrderStatus)}>
          <SelectTrigger id="orderStatus" className="w-full md:w-[200px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {availableStatuses.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isPending || selectedStatus === currentStatus}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? 'Updating...' : 'Update Status'}
      </Button>
    </form>
  );
}
