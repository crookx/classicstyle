
'use client';

import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateOrderStatusAction, type OrderActionResult } from '@/lib/actions/orderActions'; // Import type
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

      try {
        console.log("[UpdateForm] Calling updateOrderStatusAction with formData:", {orderId, status: selectedStatus});
        const result: OrderActionResult = await updateOrderStatusAction(formData); 
        
        console.log("[UpdateForm] Client received result from action (raw):", result);
        console.log("[UpdateForm] Client received result from action (stringified):", JSON.stringify(result, null, 2));

        if (result && result.success && result.newStatus) {
          toast({
            title: 'Order Status Updated',
            description: `Order ${result.orderId || orderId} status changed to ${result.newStatus}.`,
          });
          if (onStatusUpdateSuccess) {
            onStatusUpdateSuccess(result.newStatus);
          }
          setSelectedStatus(result.newStatus); // Update local state to reflect new status
        } else {
          // If result is not well-formed or explicitly indicates failure
          const serverErrorMessage = result?.error; // Get error message from server if available
          const clientFallbackMessage = 'An unexpected error occurred while updating status. Please check server logs for more details.';
          const displayMessage = serverErrorMessage || clientFallbackMessage;
          
          toast({
            title: 'Error Updating Status',
            description: displayMessage,
            variant: 'destructive',
          });
          console.error("[UpdateForm] Error details from server action (result.error):", JSON.stringify(serverErrorMessage, null, 2));
          console.error("[UpdateForm] Full result object on error:", JSON.stringify(result, null, 2));
        }
      } catch (error: any) { // Catch errors from the action call itself (e.g., network error or if action throws unhandled)
        console.error("[UpdateForm] Exception during updateOrderStatusAction call from client:", error);
        let message = 'Failed to process the request. This might be a network issue or an unhandled server error.';
        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
            message = error.message;
        } else if (error && typeof error === 'object') {
            message = JSON.stringify(error);
        }
        
        toast({
          title: 'Failed to Update Status',
          description: message,
          variant: 'destructive',
        });
         console.error("[UpdateForm] Raw error object from client catch block:", error);
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
