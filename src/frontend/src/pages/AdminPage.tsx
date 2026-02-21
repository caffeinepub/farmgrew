import { useState } from 'react';
import { useAllProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useAdminProducts';
import { useIsStripeConfigured, useSetStripeConfiguration } from '../hooks/useStripe';
import { useAdminOrders, useMarkOrderAsPaid } from '../hooks/useOrders';
import { ExternalBlob, PaymentMethod, type StripeConfiguration, type Order } from '../backend';
import { navigate } from '../router/navigation';
import TopNav from '../components/landing/TopNav';
import Footer from '../components/landing/Footer';
import Container from '../components/layout/Container';
import AdminManagement from '../components/admin/AdminManagement';
import AdminCredentialsRotation from '../components/admin/AdminCredentialsRotation';
import AdminResetCard from '../components/admin/AdminResetCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Pencil, Trash2, Image as ImageIcon, CreditCard, AlertCircle, Package, Banknote, CheckCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../backend';

const CATEGORIES = [
  'Cut Veggies & Salads',
  'Cut Fruits',
  'Batter',
  'Kitchen Needs',
  'Others',
];

interface ProductFormData {
  name: string;
  description: string;
  priceCents: string;
  category: string;
  imageFile: File | null;
}

interface StripeFormData {
  secretKey: string;
  allowedCountries: string;
}

export default function AdminPage() {
  const { data: products, isLoading, error } = useAllProducts();
  const { data: isStripeConfigured, isLoading: stripeConfigLoading } = useIsStripeConfigured();
  const { data: orders, isLoading: ordersLoading } = useAdminOrders();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const setStripeConfiguration = useSetStripeConfiguration();
  const markOrderAsPaid = useMarkOrderAsPaid();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isStripeFormOpen, setIsStripeFormOpen] = useState(false);
  const [stripeFormData, setStripeFormData] = useState<StripeFormData>({
    secretKey: '',
    allowedCountries: 'IN',
  });
  const [stripeFormErrors, setStripeFormErrors] = useState<Partial<Record<keyof StripeFormData, string>>>({});

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    priceCents: '',
    category: CATEGORIES[0],
    imageFile: null,
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      priceCents: '',
      category: CATEGORIES[0],
      imageFile: null,
    });
    setFormErrors({});
    setImagePreview(null);
    setUploadProgress(0);
    setEditingProduct(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      priceCents: product.priceCents.toString(),
      category: product.category,
      imageFile: null,
    });
    setFormErrors({});
    setUploadProgress(0);
    
    if (product.image) {
      setImagePreview(product.image.getDirectURL());
    } else {
      setImagePreview(null);
    }
    
    setIsFormOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormErrors({ ...formErrors, imageFile: 'Please select a valid image file' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors({ ...formErrors, imageFile: 'Image size must be less than 5MB' });
      return;
    }

    setFormData({ ...formData, imageFile: file });
    setFormErrors({ ...formErrors, imageFile: undefined });

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ProductFormData, string>> = {};

    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    const price = parseFloat(formData.priceCents);
    if (isNaN(price) || price < 0) {
      errors.priceCents = 'Please enter a valid price';
    }

    if (!formData.category) {
      errors.category = 'Please select a category';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const priceCents = BigInt(Math.round(parseFloat(formData.priceCents) * 100));
      
      let imageBlob: ExternalBlob | null = null;
      
      if (formData.imageFile) {
        const arrayBuffer = await formData.imageFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        imageBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      } else if (editingProduct?.image) {
        imageBlob = editingProduct.image;
      }

      if (editingProduct) {
        await updateProduct.mutateAsync({
          productId: editingProduct.id,
          name: formData.name,
          description: formData.description,
          priceCents,
          category: formData.category,
          image: imageBlob,
        });
        toast.success('Product updated successfully');
      } else {
        await createProduct.mutateAsync({
          name: formData.name,
          description: formData.description,
          priceCents,
          category: formData.category,
          image: imageBlob,
        });
        toast.success('Product created successfully');
      }

      setIsFormOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    }
  };

  const handleDeleteClick = (product: Product) => {
    setDeleteConfirmProduct(product);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmProduct) return;

    try {
      await deleteProduct.mutateAsync(deleteConfirmProduct.id);
      toast.success('Product deleted successfully');
      setDeleteConfirmProduct(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmProduct(null);
  };

  const validateStripeForm = (): boolean => {
    const errors: Partial<Record<keyof StripeFormData, string>> = {};

    if (!stripeFormData.secretKey.trim()) {
      errors.secretKey = 'Stripe secret key is required';
    }

    if (!stripeFormData.allowedCountries.trim()) {
      errors.allowedCountries = 'At least one country code is required';
    }

    setStripeFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStripeSubmit = async () => {
    if (!validateStripeForm()) return;

    try {
      const countries = stripeFormData.allowedCountries
        .split(',')
        .map((c) => c.trim().toUpperCase())
        .filter((c) => c.length > 0);

      const config: StripeConfiguration = {
        secretKey: stripeFormData.secretKey.trim(),
        allowedCountries: countries,
      };

      await setStripeConfiguration.mutateAsync(config);
      toast.success('Stripe configuration saved successfully');
      setIsStripeFormOpen(false);
      setStripeFormData({ secretKey: '', allowedCountries: 'IN' });
      setStripeFormErrors({});
    } catch (error: any) {
      toast.error(error.message || 'Failed to save Stripe configuration');
    }
  };

  const handleMarkAsPaid = async (orderId: bigint) => {
    try {
      await markOrderAsPaid.mutateAsync(orderId);
      toast.success('Order marked as paid successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark order as paid');
    }
  };

  const handleViewKOT = (orderId: bigint) => {
    navigate(`/admin/kot/${orderId.toString()}`);
  };

  const formatPrice = (priceCents: bigint): string => {
    return `₹${(Number(priceCents) / 100).toFixed(2)}`;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const codOrders = orders?.filter(
    (order) =>
      order.paymentMethod === PaymentMethod.cashOnDelivery &&
      order.paymentStatus.__kind__ === 'pending'
  ) || [];

  // All orders for KOT viewing
  const allOrders = orders || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      
      <main className="flex-1 py-12">
        <Container>
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage products, orders, Stripe configuration, and admin access
              </p>
            </div>

            {/* Admin Reset Section */}
            <AdminResetCard />

            {/* Admin Credentials Rotation Section */}
            <AdminCredentialsRotation />

            {/* Admin Management Section */}
            <AdminManagement />

            {/* Stripe Configuration Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <CardTitle>Stripe Configuration</CardTitle>
                  </div>
                  <Button
                    onClick={() => setIsStripeFormOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    {isStripeConfigured ? 'Update Configuration' : 'Configure Stripe'}
                  </Button>
                </div>
                <CardDescription>
                  Configure Stripe payment processing for your store
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stripeConfigLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Checking configuration...</span>
                  </div>
                ) : isStripeConfigured ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Stripe is configured</AlertTitle>
                    <AlertDescription>
                      Payment processing is active. Click "Update Configuration" to change settings.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Stripe not configured</AlertTitle>
                    <AlertDescription>
                      Payment processing is not available. Click "Configure Stripe" to set up payments.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Orders Management Section with Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Orders Management</CardTitle>
                <CardDescription>
                  View all orders and manage COD payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="all">All Orders</TabsTrigger>
                    <TabsTrigger value="cod">Pending COD</TabsTrigger>
                  </TabsList>

                  {/* All Orders Tab */}
                  <TabsContent value="all" className="space-y-4">
                    {ordersLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground py-8">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading orders...</span>
                      </div>
                    ) : allOrders.length === 0 ? (
                      <Alert>
                        <Package className="h-4 w-4" />
                        <AlertTitle>No orders yet</AlertTitle>
                        <AlertDescription>
                          Orders will appear here once customers start placing them.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Order ID</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Items</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>Payment</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allOrders.map((order) => (
                              <TableRow key={order.id.toString()}>
                                <TableCell className="font-medium">
                                  #{order.id.toString()}
                                </TableCell>
                                <TableCell>{formatDate(order.timestamp)}</TableCell>
                                <TableCell>
                                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                </TableCell>
                                <TableCell className="font-semibold">
                                  {formatPrice(order.totalPriceCents)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    <Badge variant="outline" className="w-fit">
                                      {order.paymentMethod === PaymentMethod.cashOnDelivery ? (
                                        <span className="flex items-center gap-1">
                                          <Banknote className="h-3 w-3" />
                                          COD
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1">
                                          <CreditCard className="h-3 w-3" />
                                          Card
                                        </span>
                                      )}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {order.paymentStatus.__kind__ === 'completed' ? 'Paid' : 'Pending'}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      order.status === 'completed'
                                        ? 'default'
                                        : order.status === 'confirmed'
                                        ? 'secondary'
                                        : 'outline'
                                    }
                                  >
                                    {order.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    onClick={() => handleViewKOT(order.id)}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                  >
                                    <FileText className="h-4 w-4" />
                                    View KOT
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>

                  {/* Pending COD Tab */}
                  <TabsContent value="cod" className="space-y-4">
                    {ordersLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground py-8">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading orders...</span>
                      </div>
                    ) : codOrders.length === 0 ? (
                      <Alert>
                        <Package className="h-4 w-4" />
                        <AlertTitle>No pending COD orders</AlertTitle>
                        <AlertDescription>
                          All COD orders have been paid or there are no COD orders yet.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-4">
                        {codOrders.map((order) => (
                          <Card key={order.id.toString()} className="border-2">
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">Order #{order.id.toString()}</h3>
                                    <Badge variant="outline" className="flex items-center gap-1">
                                      <Banknote className="h-3 w-3" />
                                      COD
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(order.timestamp)}
                                  </p>
                                  <p className="text-sm">
                                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                  </p>
                                  <p className="text-lg font-semibold text-primary">
                                    {formatPrice(order.totalPriceCents)}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleViewKOT(order.id)}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                  >
                                    <FileText className="h-4 w-4" />
                                    View KOT
                                  </Button>
                                  <Button
                                    onClick={() => handleMarkAsPaid(order.id)}
                                    disabled={markOrderAsPaid.isPending}
                                    size="sm"
                                    className="gap-2"
                                  >
                                    {markOrderAsPaid.isPending ? (
                                      <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Processing...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="h-4 w-4" />
                                        Mark as Paid
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Products Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>
                      Manage your product catalog
                    </CardDescription>
                  </div>
                  <Button onClick={openCreateDialog} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      Failed to load products. Please try again.
                    </AlertDescription>
                  </Alert>
                ) : !products || products.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No products yet. Add your first product to get started.</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id.toString()}>
                            <TableCell>
                              {product.image ? (
                                <img
                                  src={product.image.getDirectURL()}
                                  alt={product.name}
                                  className="h-12 w-12 object-cover rounded"
                                />
                              ) : (
                                <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>{formatPrice(product.priceCents)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  onClick={() => openEditDialog(product)}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteClick(product)}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>

      <Footer />

      {/* Product Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product information' : 'Fill in the details to create a new product'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
              />
              {formErrors.name && (
                <p className="text-sm text-destructive">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
                rows={3}
              />
              {formErrors.description && (
                <p className="text-sm text-destructive">{formErrors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceCents">Price (₹)</Label>
              <Input
                id="priceCents"
                type="number"
                step="0.01"
                value={formData.priceCents}
                onChange={(e) => setFormData({ ...formData, priceCents: e.target.value })}
                placeholder="0.00"
              />
              {formErrors.priceCents && (
                <p className="text-sm text-destructive">{formErrors.priceCents}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.category && (
                <p className="text-sm text-destructive">{formErrors.category}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Product Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
              />
              {formErrors.imageFile && (
                <p className="text-sm text-destructive">{formErrors.imageFile}</p>
              )}
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded border"
                  />
                </div>
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="text-sm text-muted-foreground mb-1">
                    Uploading: {uploadProgress}%
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsFormOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createProduct.isPending || updateProduct.isPending}
            >
              {createProduct.isPending || updateProduct.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingProduct ? (
                'Update Product'
              ) : (
                'Create Product'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmProduct} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteConfirmProduct?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProduct.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stripe Configuration Dialog */}
      <Dialog open={isStripeFormOpen} onOpenChange={setIsStripeFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Stripe</DialogTitle>
            <DialogDescription>
              Enter your Stripe credentials to enable payment processing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input
                id="secretKey"
                type="password"
                value={stripeFormData.secretKey}
                onChange={(e) =>
                  setStripeFormData({ ...stripeFormData, secretKey: e.target.value })
                }
                placeholder="sk_test_..."
              />
              {stripeFormErrors.secretKey && (
                <p className="text-sm text-destructive">{stripeFormErrors.secretKey}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="allowedCountries">Allowed Countries</Label>
              <Input
                id="allowedCountries"
                value={stripeFormData.allowedCountries}
                onChange={(e) =>
                  setStripeFormData({ ...stripeFormData, allowedCountries: e.target.value })
                }
                placeholder="IN, US, GB (comma-separated)"
              />
              <p className="text-xs text-muted-foreground">
                Enter country codes separated by commas (e.g., IN, US, GB)
              </p>
              {stripeFormErrors.allowedCountries && (
                <p className="text-sm text-destructive">{stripeFormErrors.allowedCountries}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsStripeFormOpen(false);
                setStripeFormData({ secretKey: '', allowedCountries: 'IN' });
                setStripeFormErrors({});
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStripeSubmit}
              disabled={setStripeConfiguration.isPending}
            >
              {setStripeConfiguration.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
