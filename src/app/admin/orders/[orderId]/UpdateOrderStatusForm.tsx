
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

// Define expected shape of the action result for clarity on client-side
interface OrderActionResult {
  success: boolean;
  error?: string;
  orderId?: string;
  newStatus?: OrderStatus;
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

      try {
        const result: OrderActionResult = await updateOrderStatusAction(formData); 
        
        console.log("Client received result from action:", JSON.stringify(result, null, 2));

        if (result && result.success && result.newStatus) {
          toast({
            title: 'Order Status Updated',
            description: `Order ${result.orderId || orderId} status changed to ${result.newStatus}.`,
          });
          if (onStatusUpdateSuccess) {
            onStatusUpdateSuccess(result.newStatus);
          }
        } else {
          const errorMessage = result?.error || 'An unexpected error occurred while updating status. No specific error message received from server.';
          toast({
            title: 'Error Updating Status',
            description: errorMessage,
            variant: 'destructive',
          });
          console.error("Error updating status from form. Full result object:", result, "Generated error message:", errorMessage);
        }
      } catch (error) {
        console.error("Exception during updateOrderStatusAction call from client:", error);
        let message = 'Failed to process the request due to a client-side or network error.';
        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
        toast({
          title: 'Failed to Update Status',
          description: message,
          variant: 'destructive',
        });
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
