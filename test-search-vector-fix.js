#!/usr/bin/env node

/**
 * Test script to verify the search vector trigger fix
 * This script tests inserting a book to ensure the trigger works correctly
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase environment variables');
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSearchVectorTrigger() {
    console.log('🧪 Testing search vector trigger fix...\n');

    try {
        // Test 1: Check current database status
        console.log('📊 Current database status:');
        const { data: books, error: booksError } = await supabase
            .from('books')
            .select('id, title, search_vector, search_text')
            .limit(5);

        if (booksError) {
            console.error('❌ Error fetching books:', booksError);
            return;
        }

        console.log(`Total books in database: ${books.length}`);
        const booksWithSearchVector = books.filter(book => book.search_vector !== null);
        console.log(`Books with search_vector: ${booksWithSearchVector.length}`);

        // Test 2: Insert a test book to verify trigger works
        console.log('\n🔧 Testing trigger with new book insertion...');
        
        const testBook = {
            title: 'Test Book for Search Vector',
            author: 'Test Author',
            category: 'Test Category',
            description: 'This is a test book to verify the search vector trigger works correctly.',
            available: true,
            status: 'available'
        };

        const { data: insertedBook, error: insertError } = await supabase
            .from('books')
            .insert([testBook])
            .select('id, title, search_vector, search_text')
            .single();

        if (insertError) {
            console.error('❌ Error inserting test book:', insertError);
            return;
        }

        console.log('✅ Test book inserted successfully!');
        console.log(`Book ID: ${insertedBook.id}`);
        console.log(`Title: ${insertedBook.title}`);
        console.log(`Has search_vector: ${insertedBook.search_vector !== null ? '✅' : '❌'}`);
        console.log(`Has search_text: ${insertedBook.search_text !== null ? '✅' : '❌'}`);

        if (insertedBook.search_vector && insertedBook.search_text) {
            console.log('\n🎉 SUCCESS: Search vector trigger is working correctly!');
            console.log('The remaining 31 books from CSV should now import successfully.');
        } else {
            console.log('\n❌ FAILURE: Search vector trigger is not working properly.');
            console.log('The trigger did not populate search_vector or search_text fields.');
        }

        // Test 3: Clean up test book
        console.log('\n🧹 Cleaning up test book...');
        const { error: deleteError } = await supabase
            .from('books')
            .delete()
            .eq('id', insertedBook.id);

        if (deleteError) {
            console.error('❌ Error deleting test book:', deleteError);
        } else {
            console.log('✅ Test book cleaned up successfully');
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

// Run the test
testSearchVectorTrigger();
