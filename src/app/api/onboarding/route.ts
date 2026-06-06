import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { goal, skip } = await request.json()

    // 1. Create Default Categories (Fetch from DB first)
    let { data: defaultDbCats } = await supabase
      .from('categories')
      .select('*')
      .is('user_id', null)

    if (!defaultDbCats || defaultDbCats.length === 0) {
      defaultDbCats = [
        { name: 'Sarapan Cepat', color: '#FFD93D' },
        { name: 'Masakan Berat', color: '#FF6B9D' },
        { name: 'Menu Diet', color: '#6BCB77' },
        { name: 'Favorit Keluarga', color: '#FF9A3C' },
      ]
    }

    const defaultCategories = defaultDbCats.map((cat: any) => ({
      name: cat.name,
      color: cat.color,
      user_id: user.id
    }))

    const { data: categories, error: catError } = await supabase
      .from('categories')
      .insert(defaultCategories)
      .select()

    if (catError) {
      console.error('Category insert error:', catError)
      return NextResponse.json({ error: catError.message }, { status: 500 })
    }

    const sarapanId = categories.find((c) => c.name.toLowerCase().includes('sarapan'))?.id || categories[0]?.id
    const beratId = categories.find((c) => c.name.toLowerCase().includes('berat') || c.name.toLowerCase().includes('siang') || c.name.toLowerCase().includes('malam'))?.id || categories[1]?.id || categories[0]?.id
    const dietId = categories.find((c) => c.name.toLowerCase().includes('diet') || c.name.toLowerCase().includes('sehat'))?.id || categories[2]?.id || categories[0]?.id
    const keluargaId = categories.find((c) => c.name.toLowerCase().includes('keluarga') || c.name.toLowerCase().includes('favorit'))?.id || categories[3]?.id || categories[0]?.id


    if (!skip && goal) {
      // 2. Define Starter Recipes
      let starterRecipes: any[] = []

      const healthRecipes = [
        {
          user_id: user.id,
          name: 'Oatmeal Pisang Cepat 🍌',
          description: 'Sarapan sehat tinggi serat dan cepat saji.',
          category_id: sarapanId,
          tags: ['Sehat', 'Sarapan', 'Cepat'],
          estimated_time_minutes: 15,
          servings: 1,
          steps: ['Masak oatmeal dengan susu cair hingga lembut.', 'Potong pisang tipis-tipis.', 'Sajikan oatmeal dalam mangkuk, tata pisang di atasnya.', 'Tuangkan madu secukupnya.'],
          is_starter: true,
          ingredients: [
            { name: 'Oatmeal', amount: 50, unit: 'g', price_per_unit: 100 },
            { name: 'Susu Cair', amount: 200, unit: 'ml', price_per_unit: 50 },
            { name: 'Pisang', amount: 1, unit: 'buah', price_per_unit: 2000 },
            { name: 'Madu', amount: 1, unit: 'sdm', price_per_unit: 1000 },
          ]
        },
        {
          user_id: user.id,
          name: 'Salad Ayam Panggang 🥗',
          description: 'Makan siang penuh protein dan vitamin.',
          category_id: dietId,
          tags: ['Diet', 'Ayam', 'Rendah Karbo'],
          estimated_time_minutes: 20,
          servings: 1,
          steps: ['Bumbui dada ayam dengan garam dan lada lalu panggang.', 'Potong selada dan tomat cherry sesuai selera.', 'Iris dada ayam panggang tipis-tipis.', 'Campurkan semua bahan di mangkuk, siram dengan olive oil.'],
          is_starter: true,
          ingredients: [
            { name: 'Dada Ayam', amount: 150, unit: 'g', price_per_unit: 80 },
            { name: 'Selada', amount: 100, unit: 'g', price_per_unit: 50 },
            { name: 'Tomat Cherry', amount: 5, unit: 'butir', price_per_unit: 1000 },
            { name: 'Olive Oil', amount: 1, unit: 'sdm', price_per_unit: 2000 },
          ]
        },
        {
          user_id: user.id,
          name: 'Sup Sayur Bening 🥕',
          description: 'Sup segar hangat yang kaya nutrisi.',
          category_id: dietId,
          tags: ['Sup', 'Sayur', 'Hangat'],
          estimated_time_minutes: 15,
          servings: 2,
          steps: ['Didihkan air dalam panci.', 'Masukkan bawang putih cincang dan wortel iris.', 'Setelah wortel agak empuk, masukkan bayam.', 'Bumbui garam, gula, dan lada. Sajikan hangat.'],
          is_starter: true,
          ingredients: [
            { name: 'Wortel', amount: 1, unit: 'buah', price_per_unit: 1500 },
            { name: 'Bayam', amount: 100, unit: 'g', price_per_unit: 30 },
            { name: 'Bawang Putih', amount: 2, unit: 'siung', price_per_unit: 500 },
            { name: 'Air', amount: 500, unit: 'ml', price_per_unit: 2 },
          ]
        },
        {
          user_id: user.id,
          name: 'Jus Hijau Detoks 🍏',
          description: 'Minuman segar penambah stamina harian.',
          category_id: sarapanId,
          tags: ['Jus', 'Detoks', 'Segar'],
          estimated_time_minutes: 5,
          servings: 1,
          steps: ['Cuci bersih semua sayur dan apel.', 'Blender semua bahan dengan air dingin.', 'Saring ampas jika ingin jus yang encer, sajikan segera.'],
          is_starter: true,
          ingredients: [
            { name: 'Apel Hijau', amount: 1, unit: 'buah', price_per_unit: 5000 },
            { name: 'Bayam', amount: 50, unit: 'g', price_per_unit: 30 },
            { name: 'Madu', amount: 1, unit: 'sdm', price_per_unit: 1000 },
            { name: 'Air', amount: 200, unit: 'ml', price_per_unit: 2 },
          ]
        },
        {
          user_id: user.id,
          name: 'Pepes Tahu Kemangi 🍃',
          description: 'Makanan tradisional sehat dikukus.',
          category_id: keluargaId,
          tags: ['Pepes', 'Tahu', 'Tradisional'],
          estimated_time_minutes: 25,
          servings: 2,
          steps: ['Hancurkan tahu putih dan campur dengan daun kemangi serta bumbu halus.', 'Bungkus adonan dengan daun pisang.', 'Kukus selama 20 menit hingga matang.'],
          is_starter: true,
          ingredients: [
            { name: 'Tahu Putih', amount: 4, unit: 'biji', price_per_unit: 1000 },
            { name: 'Daun Kemangi', amount: 1, unit: 'bungkus', price_per_unit: 2000 },
            { name: 'Daun Pisang', amount: 2, unit: 'lembar', price_per_unit: 500 },
          ]
        }
      ]

      const workoutRecipes = [
        {
          user_id: user.id,
          name: 'Smoothie Protein Pisang 🥛',
          description: 'Minuman pre/post workout tinggi protein.',
          category_id: sarapanId,
          tags: ['Protein', 'Smoothie', 'Workout'],
          estimated_time_minutes: 5,
          servings: 1,
          steps: ['Campur pisang, susu protein, dan selai kacang di blender.', 'Proses hingga lembut dan tercampur rata.', 'Sajikan segera sebelum latihan.'],
          is_starter: true,
          ingredients: [
            { name: 'Pisang', amount: 1, unit: 'buah', price_per_unit: 2000 },
            { name: 'Susu Cair', amount: 250, unit: 'ml', price_per_unit: 50 },
            { name: 'Selai Kacang', amount: 1, unit: 'sdm', price_per_unit: 1500 },
          ]
        },
        {
          user_id: user.id,
          name: 'Dada Ayam Panggang & Kentang 🍗',
          description: 'Menu andalan bulking atau asupan karbo-protein kompleks.',
          category_id: beratId,
          tags: ['Tinggi Protein', 'Ayam', 'Bulking'],
          estimated_time_minutes: 30,
          servings: 1,
          steps: ['Kupas dan rebus kentang hingga matang.', 'Panggang dada ayam yang sudah dibumbui.', 'Sajikan dada ayam panggang dengan kentang hangat dan tumis buncis.'],
          is_starter: true,
          ingredients: [
            { name: 'Dada Ayam', amount: 200, unit: 'g', price_per_unit: 80 },
            { name: 'Kentang', amount: 2, unit: 'buah', price_per_unit: 2000 },
            { name: 'Mentega', amount: 1, unit: 'sdm', price_per_unit: 1000 },
          ]
        },
        {
          user_id: user.id,
          name: 'Telur Rebus & Avocado Toast 🥑',
          description: 'Menu sarapan berenergi lemak sehat.',
          category_id: sarapanId,
          tags: ['Lemak Sehat', 'Sarapan', 'Telur'],
          estimated_time_minutes: 10,
          servings: 1,
          steps: ['Rebus telur selama 8 menit.', 'Panggang roti gandum hingga renyah.', 'Hancurkan alpukat dengan sedikit lada/garam, oleskan ke roti.', 'Iris telur rebus dan letakkan di atas alpukat.'],
          is_starter: true,
          ingredients: [
            { name: 'Telur', amount: 2, unit: 'butir', price_per_unit: 2000 },
            { name: 'Roti Gandum', amount: 2, unit: 'lembar', price_per_unit: 1500 },
            { name: 'Alpukat', amount: 1, unit: 'buah', price_per_unit: 8000 },
          ]
        },
        {
          user_id: user.id,
          name: 'Nasi Goreng Quinoa 🍚',
          description: 'Nasi goreng sehat tinggi serat pengganti nasi putih.',
          category_id: beratId,
          tags: ['Diet', 'Quinoa', 'Serat'],
          estimated_time_minutes: 20,
          servings: 2,
          steps: ['Panaskan wajan dengan sedikit minyak.', 'Tumis bawang putih dan daun bawang.', 'Masukkan quinoa masak dan sayuran campur.', 'Beri kecap asin, garam, lada. Aduk rata.'],
          is_starter: true,
          ingredients: [
            { name: 'Quinoa', amount: 150, unit: 'g', price_per_unit: 150 },
            { name: 'Telur', amount: 1, unit: 'butir', price_per_unit: 2000 },
            { name: 'Kecap Asin', amount: 1, unit: 'sdm', price_per_unit: 500 },
          ]
        },
        {
          user_id: user.id,
          name: 'Protein Bowl Salmon 🐟',
          description: 'Mangkuk salmon panggang kaya omega-3.',
          category_id: beratId,
          tags: ['Salmon', 'Omega-3', 'Protein'],
          estimated_time_minutes: 25,
          servings: 1,
          steps: ['Panggang salmon fillet dengan lada hitam dan garam.', 'Siapkan mangkuk berisi nasi merah.', 'Tata salmon, brokoli rebus, dan wortel di atas nasi.'],
          is_starter: true,
          ingredients: [
            { name: 'Salmon Fillet', amount: 120, unit: 'g', price_per_unit: 300 },
            { name: 'Beras Merah', amount: 80, unit: 'g', price_per_unit: 50 },
            { name: 'Brokoli', amount: 50, unit: 'g', price_per_unit: 100 },
          ]
        }
      ]

      if (goal === 'makan_sehat') {
        starterRecipes = healthRecipes
      } else if (goal === 'aktif_olahraga') {
        starterRecipes = workoutRecipes
      } else {
        // Gabungan
        starterRecipes = [healthRecipes[0], healthRecipes[1], healthRecipes[2], workoutRecipes[1], workoutRecipes[2]]
      }

      // Insert recipes & ingredients
      for (const recipe of starterRecipes) {
        const { ingredients, ...recipeData } = recipe

        const { data: insertedRecipe, error: recError } = await supabase
          .from('recipes')
          .insert({ ...recipeData, is_starter: true })
          .select()
          .single()

        if (recError) {
          console.error('Recipe insert error:', recError)
          continue
        }

        if (insertedRecipe && ingredients?.length > 0) {
          const ingredientsData = ingredients.map((ing: any) => ({
            recipe_id: insertedRecipe.id,
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            price_per_unit: ing.price_per_unit,
          }))

          await supabase.from('recipe_ingredients').insert(ingredientsData)
        }
      }
    }

    // 3. Update Profile
    const { error: profError } = await supabase
      .from('profiles')
      .update({
        goal: skip ? null : goal,
        onboarding_completed: true,
      })
      .eq('id', user.id)

    if (profError) {
      console.error('Profile update error:', profError)
      return NextResponse.json({ error: profError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Onboarding handler crashed:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
