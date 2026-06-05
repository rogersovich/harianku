import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getWeekStartAndEnd, getDayOfWeekWIB } from '@/lib/utils/date'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slotId, result_photo_url } = await request.json()

    // 1. Fetch the slot details
    const { data: slot, error: slotErr } = await supabase
      .from('meal_plan_slots')
      .select('*, meal_plans(week_start, user_id)')
      .eq('id', slotId)
      .single()

    if (slotErr || !slot) {
      return NextResponse.json({ error: 'Slot tidak ditemukan' }, { status: 404 })
    }

    const weekStart = slot.meal_plans.week_start
    const dayOfWeek = slot.day_of_week
    const recipeId = slot.recipe_id

    // Check if already cooked
    if (slot.is_cooked) {
      return NextResponse.json({ success: true, message: 'Sudah ditandai dimasak sebelumnya.' })
    }

    // 2. Mark the slot as cooked
    await supabase
      .from('meal_plan_slots')
      .update({ is_cooked: true, cooked_at: new Date().toISOString() })
      .eq('id', slotId)

    // Fetch recipe details to snapshot name and primary photo
    const { data: recipe } = await supabase
      .from('recipes')
      .select(`
        name,
        recipe_photos (url)
      `)
      .eq('id', recipeId)
      .single()

    const finalPhotoUrl = result_photo_url || recipe?.recipe_photos?.[0]?.url || null

    // Insert into cooking_history
    await supabase
      .from('cooking_history')
      .insert({
        user_id: user.id,
        recipe_id: recipeId,
        recipe_name_snapshot: recipe?.name || 'Resep Tanpa Nama',
        recipe_photo_snapshot: finalPhotoUrl,
        slot_type: slot.slot,
        cooked_at: new Date().toISOString()
      })

    // If custom result photo uploaded, save to recipe_photos as result
    if (result_photo_url) {
      await supabase
        .from('recipe_photos')
        .insert({
          recipe_id: recipeId,
          url: result_photo_url,
          type: 'result',
          is_primary: false
        })
    }

    // 3. Deduct stock items automatically
    // Fetch recipe ingredients
    const { data: ingredients } = await supabase
      .from('recipe_ingredients')
      .select('*')
      .eq('recipe_id', recipeId)

    const warnings: string[] = []

    if (ingredients && ingredients.length > 0) {
      // Fetch user's stock items
      const { data: stockItems } = await supabase
        .from('stock_items')
        .select('*')
        .eq('user_id', user.id)

      if (stockItems) {
        for (const ing of ingredients) {
          // Find matching stock item (case insensitive)
          const matchedStock = stockItems.find(
            (s) => s.name.toLowerCase().trim() === ing.name.toLowerCase().trim()
          )

          if (matchedStock) {
            // Check unit compatibility. If they match, deduct
            if (matchedStock.unit.toLowerCase() === ing.unit.toLowerCase()) {
              const newAmount = Math.max(0, Number(matchedStock.amount) - Number(ing.amount))
              
              await supabase
                .from('stock_items')
                .update({ amount: newAmount, updated_at: new Date().toISOString() })
                .eq('id', matchedStock.id)

              // Check threshold
              if (newAmount <= Number(matchedStock.threshold_amount)) {
                warnings.push(`${matchedStock.name} hampir habis! Sisa: ${newAmount} ${matchedStock.unit}`)
              }
            } else {
              warnings.push(`Satuan untuk ${ing.name} tidak kompatibel (${ing.unit} vs ${matchedStock.unit}). Update stok manual.`)
            }
          }
        }
      }
    }

    // 4. Update cooking streak
    // Fetch user streaks for this week
    let { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .single()

    let newStreakCount = 0

    if (streak) {
      const cookingDays = streak.cooking_days || {}
      
      // Check if user already cooked a recipe today
      const alreadyCookedToday = cookingDays[String(dayOfWeek)] !== undefined
      
      if (!alreadyCookedToday) {
        // Find how many consecutive days user has cooked up to today
        let consecutiveDays = 1
        
        // Check backwards
        for (let i = dayOfWeek - 1; i >= 1; i--) {
          if (cookingDays[String(i)] !== undefined) {
            consecutiveDays++
          } else {
            break
          }
        }
        
        // Update days
        cookingDays[String(dayOfWeek)] = recipeId
        
        await supabase
          .from('streaks')
          .update({
            cooking_days: cookingDays,
            cooking_streak: consecutiveDays
          })
          .eq('id', streak.id)
          
        newStreakCount = consecutiveDays
      } else {
        newStreakCount = streak.cooking_streak
      }
    }

    return NextResponse.json({
      success: true,
      warnings,
      cooking_streak: newStreakCount
    })
  } catch (err: any) {
    console.error('Cook Slot API Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
