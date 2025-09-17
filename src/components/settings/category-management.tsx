'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Plus, Edit, Trash2, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { createClientComponentClient } from '@/lib/supabase'

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name too long'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface Category {
  id: string
  name: string
  color: string
  is_default: boolean
  expense_count?: number
}

interface CategoryManagementProps {
  categories: Category[]
  userId: string
}

const predefinedColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#6b7280', '#374151'
]

export function CategoryManagement({ categories: initialCategories, userId }: CategoryManagementProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const supabase = createClientComponentClient()

  const addForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      color: predefinedColors[0],
    },
  })

  const editForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      color: predefinedColors[0],
    },
  })

  const handleAddCategory = async (data: CategoryFormData) => {
    try {
      const { data: newCategory, error } = await supabase
        .from('categories')
        .insert({
          user_id: userId,
          name: data.name,
          color: data.color,
          is_default: false,
        })
        .select()
        .single()

      if (error) throw error

      setCategories(prev => [...prev, { ...newCategory, expense_count: 0 }])
      setIsAddDialogOpen(false)
      addForm.reset()
      toast.success('Category created successfully!')
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Failed to create category')
    }
  }

  const handleEditCategory = async (data: CategoryFormData) => {
    if (!editingCategory) return

    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: data.name,
          color: data.color,
        })
        .eq('id', editingCategory.id)

      if (error) throw error

      setCategories(prev => 
        prev.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, name: data.name, color: data.color }
            : cat
        )
      )
      setIsEditDialogOpen(false)
      setEditingCategory(null)
      editForm.reset()
      toast.success('Category updated successfully!')
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('Failed to update category')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw error

      setCategories(prev => prev.filter(cat => cat.id !== categoryId))
      toast.success('Category deleted successfully!')
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    }
  }

  const startEditing = (category: Category) => {
    setEditingCategory(category)
    editForm.setValue('name', category.name)
    editForm.setValue('color', category.color)
    setIsEditDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>
              Manage your expense categories. Default categories cannot be deleted.
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Create a new expense category with a custom color.
                </DialogDescription>
              </DialogHeader>
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(handleAddCategory)} className="space-y-4">
                  <FormField
                    control={addForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Entertainment, Groceries" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Color</FormLabel>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <FormControl>
                              <Input
                                type="color"
                                className="w-16 h-10 p-1 rounded border"
                                {...field}
                              />
                            </FormControl>
                            <Input
                              placeholder="#000000"
                              value={field.value}
                              onChange={field.onChange}
                              className="font-mono"
                            />
                          </div>
                          <div className="grid grid-cols-10 gap-2">
                            {predefinedColors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`w-8 h-8 rounded-full border-2 transition-all ${
                                  field.value === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => field.onChange(color)}
                              />
                            ))}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      Create Category
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No categories found. Add your first category to get started.
            </div>
          ) : (
            <div className="grid gap-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category.name}</span>
                        {category.is_default && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      {category.expense_count !== undefined && (
                        <p className="text-sm text-muted-foreground">
                          {category.expense_count} expense{category.expense_count !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {!category.is_default && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Category</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;{category.name}&quot;? This action cannot be undone.
                              {category.expense_count && category.expense_count > 0 && (
                                <span className="block mt-2 text-destructive font-medium">
                                  Warning: This category has {category.expense_count} expense{category.expense_count !== 1 ? 's' : ''}. 
                                  Deleting it will affect those records.
                                </span>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCategory(category.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Update the category name and color.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEditCategory)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Category name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Color</FormLabel>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <FormControl>
                            <Input
                              type="color"
                              className="w-16 h-10 p-1 rounded border"
                              {...field}
                            />
                          </FormControl>
                          <Input
                            placeholder="#000000"
                            value={field.value}
                            onChange={field.onChange}
                            className="font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-10 gap-2">
                          {predefinedColors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`w-8 h-8 rounded-full border-2 transition-all ${
                                field.value === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => field.onChange(color)}
                            />
                          ))}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    Update Category
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
