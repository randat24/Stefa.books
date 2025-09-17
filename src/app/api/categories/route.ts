import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

// GET /api/categories - получение всех категорий
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tree = searchParams.get('tree') === 'true'
    const parentId = searchParams.get('parent_id')

    logger.info('📚 Fetching categories', { tree, parentId })

    if (tree) {
      // Получение дерева категорий
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        .order('name')

      if (error) {
        logger.error('Error fetching category tree', error)
        return NextResponse.json(
          { success: false, data: [], error: error.message },
          { status: 500 }
        )
      }

      // Построение дерева категорий
      const treeData = buildCategoryTree(data || [])
      
      logger.info(`✅ Fetched category tree with ${treeData.length} root categories`)
      return NextResponse.json({
        success: true,
        data: treeData,
        count: treeData.length
      })
    }

    if (parentId) {
      // Получение дочерних категорий
      const { data, error, count } = await supabase
        .from('categories')
        .select('*', { count: 'exact' })
        .eq('parent_id', parentId)
        .eq('is_active', true)
        .order('sort_order')
        .order('name')

      if (error) {
        logger.error('Error fetching child categories', error)
        return NextResponse.json(
          { success: false, data: [], error: error.message },
          { status: 500 }
        )
      }

      logger.info(`✅ Fetched ${data?.length || 0} child categories for parent ${parentId}`)
      return NextResponse.json({
        success: true,
        data: data || [],
        count: count || 0
      })
    }

    // Получение всех активных категорий
    const { data, error, count } = await supabase
      .from('categories')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('sort_order')
      .order('name')

    if (error) {
      logger.error('Error fetching categories', error)
      return NextResponse.json(
        { success: false, data: [], error: error.message },
        { status: 500 }
      )
    }

    logger.info(`✅ Fetched ${data?.length || 0} categories`)
    return NextResponse.json({
      success: true,
      data: data || [],
      count: count || 0
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Unexpected error in categories GET', { error: message })
    return NextResponse.json(
      { success: false, data: [], error: message },
      { status: 500 }
    )
  }
}

// POST /api/categories - специальные операции (breadcrumbs, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, category_id } = body

    logger.info('📚 Categories POST request', { action, category_id })

    if (action === 'get_breadcrumbs' && category_id) {
      // Получение хлебных крошек для категории
      const breadcrumbs = await getCategoryBreadcrumbs(category_id)
      
      logger.info(`✅ Fetched breadcrumbs for category ${category_id}`)
      return NextResponse.json({
        success: true,
        data: breadcrumbs
      })
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action' },
      { status: 400 }
    )

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Unexpected error in categories POST', { error: message })
    return NextResponse.json(
      { success: false, data: [], error: message },
      { status: 500 }
    )
  }
}

/**
 * Построение дерева категорий из плоского списка
 */
function buildCategoryTree(flatList: any[]): any[] {
  const itemsById: Record<string, any> = {}
  const rootItems: any[] = []

  // Сначала создаем объекты для всех элементов
  flatList.forEach(item => {
    itemsById[item.id] = {
      ...item,
      children: []
    }
  })

  // Затем строим иерархию
  flatList.forEach(item => {
    const currentItem = itemsById[item.id]
    
    if (item.parent_id && itemsById[item.parent_id]) {
      // Добавляем к родительскому элементу
      if (!itemsById[item.parent_id].children) {
        itemsById[item.parent_id].children = []
      }
      itemsById[item.parent_id].children.push(currentItem)
    } else {
      // Это корневой элемент
      rootItems.push(currentItem)
    }
  })

  // Сортируем детей по sort_order
  Object.values(itemsById).forEach(item => {
    if (item.children && item.children.length > 0) {
      item.children.sort((a: any, b: any) => {
        const sortA = a.sort_order || a.display_order || 0
        const sortB = b.sort_order || b.display_order || 0
        return sortA - sortB
      })
    }
  })

  return rootItems.sort((a: any, b: any) => {
    const sortA = a.sort_order || a.display_order || 0
    const sortB = b.sort_order || b.display_order || 0
    return sortA - sortB
  })
}

/**
 * Получение хлебных крошек для категории
 */
async function getCategoryBreadcrumbs(categoryId: string): Promise<any[]> {
  const breadcrumbs: any[] = []
  let currentId = categoryId

  while (currentId) {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, parent_id')
      .eq('id', currentId)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      logger.error('Error fetching category for breadcrumbs', { categoryId: currentId, error })
      break
    }

    breadcrumbs.unshift({
      id: data.id,
      name: data.name,
      slug: data.slug
    })

    currentId = data.parent_id
  }

  return breadcrumbs
}