
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, MoreVertical, Mail, ShoppingBag, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getUsers } from '@/lib/firebase/firestoreService';
import type { UserProfile } from '@/types';
import { format } from 'date-fns';

export default async function AdminCustomersPage() {
  const customers: UserProfile[] = await getUsers();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Manage Customers</h1>
          <p className="text-muted-foreground">View customer profiles from Firestore.</p>
        </div>
         <Button disabled> {/* This functionality would require more complex user management roles */}
            <Users className="mr-2 h-5 w-5" /> Add New Customer (Coming Soon)
        </Button>
      </div>
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-3 h-6 w-6 text-primary" />
            Customer List ({customers.length})
          </CardTitle>
          <CardDescription>
            A list of registered users who have signed up. 
            Extended profile information (like order history) would require further integration.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {customers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Avatar</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Display Name</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  {/* <TableHead className="text-center hidden sm:table-cell">Orders</TableHead> */}
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
                    {/* <TableCell className="text-center hidden sm:table-cell">0</TableCell> */}
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled> {/* Actions disabled for now */}
                            <MoreVertical className="h-4 w-4" />
                             <span className="sr-only">Customer Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem disabled><UserCircle className="mr-2 h-4 w-4"/>View Profile</DropdownMenuItem>
                          <DropdownMenuItem disabled><ShoppingBag className="mr-2 h-4 w-4"/>View Orders</DropdownMenuItem>
                          <DropdownMenuItem disabled><Mail className="mr-2 h-4 w-4"/>Send Email</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-12 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No customers found.</p>
                <p>Ensure users have signed up and their profiles are being created in Firestore.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
