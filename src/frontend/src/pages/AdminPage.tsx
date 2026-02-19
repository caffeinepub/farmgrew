import { useState } from 'react';
import { useAllProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useAdminProducts';
import { useIsStripeConfigured, useSetStripeConfiguration } from '../hooks/useStripe';
import { ExternalBlob, type StripeConfiguration } from '../backend';
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
import { Loader2, Plus, Pencil, Trash2, Image as ImageIcon, CreditCard, AlertCircle } from 'lucide-react';
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
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const setStripeConfiguration = useSetStripeConfiguration();

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

  const formatPrice = (priceCents: bigint): string => {
    return `₹${(Number(priceCents) / 100).toFixed(2)}`;
  };

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
                Manage products, Stripe configuration, and admin access
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
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error loading products</AlertTitle>
                    <AlertDescription>
                      {error instanceof Error ? error.message : 'Failed to load products'}
                    </AlertDescription>
                  </Alert>
                ) : !products || products.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No products yet</p>
                    <Button onClick={openCreateDialog} variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Your First Product
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Image</TableHead>
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
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>{formatPrice(product.priceCents)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(product)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(product)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
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
              {editingProduct ? 'Update product information' : 'Add a new product to your catalog'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setFormErrors({ ...formErrors, name: undefined });
                }}
                placeholder="e.g., Fresh Carrots"
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
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  setFormErrors({ ...formErrors, description: undefined });
                }}
                placeholder="Describe the product..."
                rows={3}
              />
              {formErrors.description && (
                <p className="text-sm text-destructive">{formErrors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceCents">Price (₹)</Label>
                <Input
                  id="priceCents"
                  type="number"
                  step="0.01"
                  value={formData.priceCents}
                  onChange={(e) => {
                    setFormData({ ...formData, priceCents: e.target.value });
                    setFormErrors({ ...formErrors, priceCents: undefined });
                  }}
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
                  onValueChange={(value) => {
                    setFormData({ ...formData, category: value });
                    setFormErrors({ ...formErrors, category: undefined });
                  }}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
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
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
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
                'Add Product'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmProduct} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirmProduct?.name}"? This action cannot be undone.
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
              Set up Stripe payment processing for your store
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secretKey">Stripe Secret Key</Label>
              <Input
                id="secretKey"
                type="password"
                value={stripeFormData.secretKey}
                onChange={(e) => {
                  setStripeFormData({ ...stripeFormData, secretKey: e.target.value });
                  setStripeFormErrors({ ...stripeFormErrors, secretKey: undefined });
                }}
                placeholder="sk_test_..."
              />
              {stripeFormErrors.secretKey && (
                <p className="text-sm text-destructive">{stripeFormErrors.secretKey}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="allowedCountries">Allowed Countries (comma-separated)</Label>
              <Input
                id="allowedCountries"
                value={stripeFormData.allowedCountries}
                onChange={(e) => {
                  setStripeFormData({ ...stripeFormData, allowedCountries: e.target.value });
                  setStripeFormErrors({ ...stripeFormErrors, allowedCountries: undefined });
                }}
                placeholder="IN, US, GB"
              />
              {stripeFormErrors.allowedCountries && (
                <p className="text-sm text-destructive">{stripeFormErrors.allowedCountries}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Enter country codes (e.g., IN for India, US for United States)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStripeFormOpen(false)}>
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
