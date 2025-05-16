
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, MoreVertical, Mail, ShoppingBag, UserCircle, AlertTriangle, Loader2, PlusCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getUsers as fetchUsersFromDB } from '@/lib/firebase/firestoreService';
import type { UserProfile } from '@/types';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast'; // Import useToast

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast(); // Initialize toast

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser || isAdmin === false) {
        router.push('/login?redirect=/admin/customers');
        return;
      }
      if (currentUser && isAdmin) {
        const loadCustomers = async () => {
          setIsLoading(true);
          setError(null);
          try {
            const fetchedCustomers = await fetchUsersFromDB();
            setCustomers(fetchedCustomers);
          } catch (e: any) {
            console.error("Error fetching customers:", e);
            setError("Failed to load customers. " + (e.message.includes("permission") ? "Check Firestore permissions." : e.message));
          } finally {
            setIsLoading(false);
          }
        };
        loadCustomers();
      }
    }
  }, [currentUser, isAdmin, authLoading, router]);

  const handleCustomerAction = (action: string, customerName: string) => {
    toast({
      title: 'Action Clicked',
      description: `${action} for ${customerName} (Not yet implemented).`,
    });
  };

  if (authLoading || (isLoading && (!currentUser || isAdmin === null))) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading customers...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Manage Customers</h1>
          <p className="text-muted-foreground">View customer profiles from Firestore.</p>
        </div>
         <Link href="/admin/customers/new">
            <Button> 
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Customer
            </Button>
        </Link>
      </div>
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-3 h-6 w-6 text-primary" />
            Customer List ({customers.length})
          </CardTitle>
          <CardDescription>
             {error ? (
                <span className="text-destructive flex items-center"><AlertTriangle className="mr-2 h-4 w-4" />{error}</span>
            ) : (
               "A list of registered users. New users appear here after signup."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
           {!error && customers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Avatar</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Display Name</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Avatar>
                        {customer.photoURL && <AvatarImage src={customer.photoURL} alt={customer.displayName || customer.email} data-ai-hint="user avatar" />}
                        <AvatarFallback>
                          {customer.displayName ? customer.displayName.substring(0, 2).toUpperCase() : customer.email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{customer.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{customer.displayName || 'N/A'}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {customer.createdAt ? format(new Date(customer.createdAt), 'PPP') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"> 
                            <MoreVertical className="h-4 w-4" />
                             <span className="sr-only">Customer Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleCustomerAction('View Profile', customer.displayName || customer.email)}>
                            <UserCircle className="mr-2 h-4 w-4"/>View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCustomerAction('View Orders', customer.displayName || customer.email)}>
                            <ShoppingBag className="mr-2 h-4 w-4"/>View Orders
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCustomerAction('Send Email', customer.displayName || customer.email)}>
                            <Mail className="mr-2 h-4 w-4"/>Send Email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !error && (
             <div className="text-center py-12 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No customers found.</p>
                <p>New users will appear here after they sign up.</p>
                <p className="mt-2 text-sm">If you have recently added users, ensure your Firestore permissions allow listing for admins.</p>
            </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
