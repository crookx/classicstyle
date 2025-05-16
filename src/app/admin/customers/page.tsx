
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, MoreVertical, Mail, ShoppingBag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const mockCustomers = [
  { id: "CUST001", name: "Alice Wonderland", email: "alice@example.com", joined: "2023-01-15", totalOrders: 5, totalSpent: "$450.75", avatarUrl: "https://placehold.co/40x40.png?text=AW" },
  { id: "CUST002", name: "Bob The Builder", email: "bob@example.com", joined: "2023-02-20", totalOrders: 2, totalSpent: "$120.00", avatarUrl: "https://placehold.co/40x40.png?text=BB" },
  { id: "CUST003", name: "Charlie Brown", email: "charlie@example.com", joined: "2023-03-05", totalOrders: 8, totalSpent: "$780.20", avatarUrl: "https://placehold.co/40x40.png?text=CB" },
  { id: "CUST004", name: "Diana Prince", email: "diana@example.com", joined: "2023-04-10", totalOrders: 3, totalSpent: "$215.50", avatarUrl: "https://placehold.co/40x40.png?text=DP" },
  { id: "CUST005", name: "Edward Scissorhands", email: "edward@example.com", joined: "2023-05-25", totalOrders: 1, totalSpent: "$55.00" },
];


export default function AdminCustomersPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Manage Customers</h1>
          <p className="text-muted-foreground">View customer profiles and their history.</p>
        </div>
         <Button disabled>
            <Users className="mr-2 h-5 w-5" /> Add New Customer (Coming Soon)
        </Button>
      </div>
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-3 h-6 w-6 text-primary" />
            Customer List
          </CardTitle>
          <CardDescription>
            A list of registered customers. Full functionality coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {mockCustomers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">Orders</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={customer.avatarUrl} alt={customer.name} data-ai-hint="user avatar" />
                        <AvatarFallback>{customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{customer.email}</TableCell>
                    <TableCell className="hidden lg:table-cell">{customer.joined}</TableCell>
                    <TableCell className="text-center hidden sm:table-cell">{customer.totalOrders}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled>
                            <MoreVertical className="h-4 w-4" />
                             <span className="sr-only">Customer Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem disabled><Users className="mr-2 h-4 w-4"/>View Profile</DropdownMenuItem>
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
                <p>Customer management features are under development.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
