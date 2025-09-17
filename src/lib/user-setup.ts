import { createClientComponentClient } from '@/lib/supabase'

export async function ensureUserSetup(userId: string) {
  const supabase = createClientComponentClient()
  
  try {
    // Check if user settings exist
    const { data: userSettings, error: settingsError } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (settingsError && settingsError.code === 'PGRST116') {
      // User settings don't exist, create them
      console.log('Creating user settings for new user')
      const { error: createSettingsError } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          timezone: 'America/Halifax',
          currency: 'CAD',
          weekly_digest_enabled: true,
          weekly_digest_day: 1
        })

      if (createSettingsError) {
        console.error('Error creating user settings:', createSettingsError)
      }
    }

    // Check if categories exist
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (categoriesError) {
      console.error('Error checking categories:', categoriesError)
    } else if (!categories || categories.length === 0) {
      // Categories don't exist, create them
      console.log('Creating default categories for new user')
      const defaultCategories = [
        { name: 'Food & Dining', color: '#EF4444', icon: 'utensils' },
        { name: 'Transportation', color: '#3B82F6', icon: 'car' },
        { name: 'Shopping', color: '#8B5CF6', icon: 'shopping-bag' },
        { name: 'Entertainment', color: '#F59E0B', icon: 'film' },
        { name: 'Bills & Utilities', color: '#10B981', icon: 'receipt' },
        { name: 'Healthcare', color: '#EF4444', icon: 'heart' },
        { name: 'Education', color: '#6366F1', icon: 'book-open' },
        { name: 'Personal Care', color: '#EC4899', icon: 'sparkles' },
        { name: 'Travel', color: '#06B6D4', icon: 'plane' },
        { name: 'Other', color: '#6B7280', icon: 'more-horizontal' }
      ]

      const { error: createCategoriesError } = await supabase
        .from('categories')
        .insert(
          defaultCategories.map(category => ({
            user_id: userId,
            name: category.name,
            color: category.color,
            icon: category.icon,
            is_default: true
          }))
        )

      if (createCategoriesError) {
        console.error('Error creating categories:', createCategoriesError)
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in ensureUserSetup:', error)
    return { success: false, error }
  }
}
