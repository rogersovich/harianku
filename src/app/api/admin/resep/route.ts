import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function checkAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') return null
  return user
}

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await checkAdmin(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let { data: recipes, error } = await supabase
      .from('recipes')
      .select(`
        *,
        categories (
          id,
          name,
          color
        ),
        recipe_ingredients (
          id,
          name,
          amount,
          unit,
          price_per_unit
        ),
        recipe_photos (
          id,
          url,
          type,
          is_primary
        )
      `)
      .eq('is_starter', true)
      .is('user_id', null)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Auto-seed if empty!
    if (!recipes || recipes.length === 0) {
      // 1. Fetch default categories
      const { data: defaultCats } = await supabase
        .from('categories')
        .select('*')
        .is('user_id', null)

      if (defaultCats && defaultCats.length > 0) {
        const sarapanId = defaultCats.find((c) => c.name.toLowerCase().includes('sarapan'))?.id || defaultCats[0]?.id
        const beratId = defaultCats.find((c) => c.name.toLowerCase().includes('berat'))?.id || defaultCats[1]?.id || defaultCats[0]?.id
        const dietId = defaultCats.find((c) => c.name.toLowerCase().includes('diet'))?.id || defaultCats[2]?.id || defaultCats[0]?.id
        const keluargaId = defaultCats.find((c) => c.name.toLowerCase().includes('keluarga'))?.id || defaultCats[3]?.id || defaultCats[0]?.id

        const defaultRecipes = [
          {
            name: 'Oatmeal Pisang Cepat 🍌',
            description: 'Sarapan sehat tinggi serat dan cepat saji.',
            category_id: sarapanId,
            tags: ['Sehat', 'Sarapan', 'Cepat'],
            estimated_time_minutes: 15,
            servings: 1,
            steps: ['Masak oatmeal dengan susu cair hingga lembut.', 'Potong pisang tipis-tipis.', 'Sajikan oatmeal dalam mangkuk, tata pisang di atasnya.', 'Tuangkan madu secukupnya.'],
            is_starter: true,
            user_id: null,
            ingredients: [
              { name: 'Oatmeal', amount: 50, unit: 'g', price_per_unit: 100 },
              { name: 'Susu Cair', amount: 200, unit: 'ml', price_per_unit: 50 },
              { name: 'Pisang', amount: 1, unit: 'buah', price_per_unit: 2000 },
              { name: 'Madu', amount: 1, unit: 'sdm', price_per_unit: 1000 },
            ]
          },
          {
            name: 'Salad Ayam Panggang 🥗',
            description: 'Makan siang penuh protein dan vitamin.',
            category_id: dietId,
            tags: ['Diet', 'Ayam', 'Rendah Karbo'],
            estimated_time_minutes: 20,
            servings: 1,
            steps: ['Bumbui dada ayam dengan garam dan lada lalu panggang.', 'Potong selada dan tomat cherry sesuai selera.', 'Iris dada ayam panggang tipis-tipis.', 'Campurkan semua bahan di mangkuk, siram dengan olive oil.'],
            is_starter: true,
            user_id: null,
            ingredients: [
              { name: 'Dada Ayam', amount: 150, unit: 'g', price_per_unit: 80 },
              { name: 'Selada', amount: 100, unit: 'g', price_per_unit: 50 },
              { name: 'Tomat Cherry', amount: 5, unit: 'butir', price_per_unit: 1000 },
              { name: 'Olive Oil', amount: 1, unit: 'sdm', price_per_unit: 2000 },
            ]
          },
          {
            name: 'Sup Sayur Bening 🥕',
            description: 'Sup segar hangat yang kaya nutrisi.',
            category_id: dietId,
            tags: ['Sup', 'Sayur', 'Hangat'],
            estimated_time_minutes: 15,
            servings: 2,
            steps: ['Didihkan air dalam panci.', 'Masukkan bawang putih cincang dan wortel iris.', 'Setelah wortel agak empuk, masukkan bayam.', 'Bumbui garam, gula, dan lada. Sajikan hangat.'],
            is_starter: true,
            user_id: null,
            ingredients: [
              { name: 'Wortel', amount: 1, unit: 'buah', price_per_unit: 1500 },
              { name: 'Bayam', amount: 100, unit: 'g', price_per_unit: 30 },
              { name: 'Bawang Putih', amount: 2, unit: 'siung', price_per_unit: 500 },
              { name: 'Air', amount: 500, unit: 'ml', price_per_unit: 2 },
            ]
          },
          {
            name: 'Jus Hijau Detoks 🍏',
            description: 'Minuman segar penambah stamina harian.',
            category_id: sarapanId,
            tags: ['Jus', 'Detoks', 'Segar'],
            estimated_time_minutes: 5,
            servings: 1,
            steps: ['Cuci bersih semua sayur dan apel.', 'Blender semua bahan dengan air dingin.', 'Saring ampas jika ingin jus yang encer, sajikan segera.'],
            is_starter: true,
            user_id: null,
            ingredients: [
              { name: 'Apel Hijau', amount: 1, unit: 'buah', price_per_unit: 5000 },
              { name: 'Bayam', amount: 50, unit: 'g', price_per_unit: 30 },
              { name: 'Madu', amount: 1, unit: 'sdm', price_per_unit: 1000 },
              { name: 'Air', amount: 200, unit: 'ml', price_per_unit: 2 },
            ]
          },
          {
            name: 'Pepes Tahu Kemangi 🍃',
            description: 'Makanan tradisional sehat dikukus.',
            category_id: keluargaId,
            tags: ['Pepes', 'Tahu', 'Tradisional'],
            estimated_time_minutes: 25,
            servings: 2,
            steps: ['Hancurkan tahu putih dan campur dengan daun kemangi serta bumbu halus.', 'Bungkus adonan dengan daun pisang.', 'Kukus selama 20 menit hingga matang.'],
            is_starter: true,
            user_id: null,
            ingredients: [
              { name: 'Tahu Putih', amount: 4, unit: 'biji', price_per_unit: 1000 },
              { name: 'Daun Kemangi', amount: 1, unit: 'bungkus', price_per_unit: 2000 },
              { name: 'Daun Pisang', amount: 2, unit: 'lembar', price_per_unit: 500 },
            ]
          },
          {
            name: 'Smoothie Protein Pisang 🥛',
            description: 'Minuman pre/post workout tinggi protein.',
            category_id: sarapanId,
            tags: ['Protein', 'Smoothie', 'Workout'],
            estimated_time_minutes: 5,
            servings: 1,
            steps: ['Campur pisang, susu protein, dan selai kacang di blender.', 'Proses hingga lembut dan tercampur rata.', 'Sajikan segera sebelum latihan.'],
            is_starter: true,
            user_id: null,
            ingredients: [
              { name: 'Pisang', amount: 1, unit: 'buah', price_per_unit: 2000 },
              { name: 'Susu Cair', amount: 250, unit: 'ml', price_per_unit: 50 },
              { name: 'Selai Kacang', amount: 1, unit: 'sdm', price_per_unit: 1500 },
            ]
          },
          {
            name: 'Dada Ayam Panggang & Kentang 🍗',
            description: 'Menu andalan bulking atau asupan karbo-protein kompleks.',
            category_id: beratId,
            tags: ['Tinggi Protein', 'Ayam', 'Bulking'],
            estimated_time_minutes: 30,
            servings: 1,
            steps: ['Kupas dan rebus kentang hingga matang.', 'Panggang dada ayam yang sudah dibumbui.', 'Sajikan dada ayam panggang dengan kentang hangat dan tumis buncis.'],
            is_starter: true,
            user_id: null,
            ingredients: [
              { name: 'Dada Ayam', amount: 200, unit: 'g', price_per_unit: 80 },
              { name: 'Kentang', amount: 2, unit: 'buah', price_per_unit: 2000 },
              { name: 'Mentega', amount: 1, unit: 'sdm', price_per_unit: 1000 },
            ]
          },
          {
            name: 'Telur Rebus & Avocado Toast 🥑',
            description: 'Menu sarapan berenergi lemak sehat.',
            category_id: sarapanId,
            tags: ['Lemak Sehat', 'Sarapan', 'Telur'],
            estimated_time_minutes: 10,
            servings: 1,
            steps: ['Rebus telur selama 8 menit.', 'Panggang roti gandum hingga renyah.', 'Hancurkan alpukat dengan sedikit lada/garam, oleskan ke roti.', 'Iris telur rebus dan letakkan di atas alpukat.'],
            is_starter: true,
            user_id: null,
            ingredients: [
              { name: 'Telur', amount: 2, unit: 'butir', price_per_unit: 2000 },
              { name: 'Roti Gandum', amount: 2, unit: 'lembar', price_per_unit: 1500 },
              { name: 'Alpukat', amount: 1, unit: 'buah', price_per_unit: 8000 },
            ]
          },
          {
            name: 'Nasi Goreng Quinoa 🍚',
            description: 'Nasi goreng sehat tinggi serat pengganti nasi putih.',
            category_id: beratId,
            tags: ['Diet', 'Quinoa', 'Serat'],
            estimated_time_minutes: 20,
            servings: 2,
            steps: ['Panaskan wajan dengan sedikit minyak.', 'Tumis bawang putih and daun bawang.', 'Masukkan quinoa masak dan sayuran campur.', 'Beri kecap asin, garam, lada. Aduk rata.'],
            is_starter: true,
            user_id: null,
            ingredients: [
              { name: 'Quinoa', amount: 150, unit: 'g', price_per_unit: 150 },
              { name: 'Telur', amount: 1, unit: 'butir', price_per_unit: 2000 },
              { name: 'Kecap Asin', amount: 1, unit: 'sdm', price_per_unit: 500 },
            ]
          },
          {
            name: 'Protein Bowl Salmon 🐟',
            description: 'Mangkuk salmon panggang kaya omega-3.',
            category_id: beratId,
            tags: ['Salmon', 'Omega-3', 'Protein'],
            estimated_time_minutes: 25,
            servings: 1,
            steps: ['Panggang salmon fillet dengan lada hitam dan garam.', 'Siapkan mangkuk berisi nasi merah.', 'Tata salmon, brokoli rebus, dan wortel di atas nasi.'],
            is_starter: true,
            user_id: null,
            ingredients: [
              { name: 'Salmon Fillet', amount: 120, unit: 'g', price_per_unit: 300 },
              { name: 'Beras Merah', amount: 80, unit: 'g', price_per_unit: 50 },
              { name: 'Brokoli', amount: 50, unit: 'g', price_per_unit: 100 },
            ]
          }
        ]

        for (const r of defaultRecipes) {
          const { ingredients, ...recipeData } = r
          const { data: insertedRec, error: recErr } = await supabase
            .from('recipes')
            .insert(recipeData)
            .select()
            .single()

          if (!recErr && insertedRec && ingredients.length > 0) {
            const ingData = ingredients.map((ing: any) => ({
              recipe_id: insertedRec.id,
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
              price_per_unit: ing.price_per_unit
            }))
            await supabase.from('recipe_ingredients').insert(ingData)
          }
        }

        // Fetch again to return populated recipes
        const { data: refetched } = await supabase
          .from('recipes')
          .select(`
            *,
            categories (
              id,
              name,
              color
            ),
            recipe_ingredients (
              id,
              name,
              amount,
              unit,
              price_per_unit
            ),
            recipe_photos (
              id,
              url,
              type,
              is_primary
            )
          `)
          .eq('is_starter', true)
          .is('user_id', null)
          .order('created_at', { ascending: false })

        if (refetched) recipes = refetched
      }
    }

    return NextResponse.json(recipes || [])
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const user = await checkAdmin(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      category_id,
      tags,
      estimated_time_minutes,
      servings,
      steps,
      ingredients, // Array: { name, amount, unit, price_per_unit }
      photo_url
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Nama resep wajib diisi' }, { status: 400 })
    }

    // Insert recipe
    const { data: recipe, error: recipeErr } = await supabase
      .from('recipes')
      .insert({
        name,
        description,
        category_id: category_id || null,
        tags: tags || [],
        estimated_time_minutes: estimated_time_minutes ? Number(estimated_time_minutes) : null,
        servings: servings ? Number(servings) : 1,
        steps: steps || [],
        is_starter: true,
        user_id: null // System recipe
      })
      .select()
      .single()

    if (recipeErr || !recipe) {
      return NextResponse.json({ error: recipeErr?.message || 'Gagal menyimpan resep' }, { status: 500 })
    }

    // Insert ingredients
    if (ingredients && ingredients.length > 0) {
      const ingData = ingredients.map((ing: any) => ({
        recipe_id: recipe.id,
        name: ing.name,
        amount: Number(ing.amount),
        unit: ing.unit,
        price_per_unit: ing.price_per_unit ? Number(ing.price_per_unit) : null
      }))

      const { error: ingErr } = await supabase.from('recipe_ingredients').insert(ingData)
      if (ingErr) {
        console.error('Ingredients insert error:', ingErr)
      }
    }

    // Insert photo if provided
    if (photo_url) {
      await supabase.from('recipe_photos').insert({
        recipe_id: recipe.id,
        url: photo_url,
        type: 'reference',
        is_primary: true
      })
    }

    return NextResponse.json({ success: true, recipeId: recipe.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
