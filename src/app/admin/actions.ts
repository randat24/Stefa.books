'use server'

import { revalidatePath } from 'next/cache'

export async function createBook(bookData: any) {
  try {
    // TODO: Implement book creation logic
    console.log('Creating book with data:', bookData)
    
    // Revalidate the admin page to show updated data
    revalidatePath('/admin')
    
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function updateBook(id: string, bookData: any) {
  try {
    const response = await fetch(`/api/admin/books/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookData),
    })

    const result = await response.json()

    if (!response.ok) {
      return { 
        success: false, 
        error: result.error || 'Ошибка обновления книги' 
      }
    }

    // Revalidate the admin page to show updated data
    revalidatePath('/admin')
    
    return { success: true, data: result.data, error: null }
  } catch (error) {
    console.error('Update book error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
    }
  }
}

export async function deleteBook(id: string) {
  try {
    const response = await fetch(`/api/admin/books/${id}`, {
      method: 'DELETE',
    })

    const result = await response.json()

    if (!response.ok) {
      return { 
        success: false, 
        error: result.error || 'Ошибка удаления книги' 
      }
    }

    // Revalidate the admin page to show updated data
    revalidatePath('/admin')
    
    return { success: true, error: null }
  } catch (error) {
    console.error('Delete book error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
    }
  }
}
