import { searchService } from './searchService';

// Simple test to verify search functionality
async function testSearch() {
  try {
    console.log('Testing search functionality...');
    
    // Test basic search
    const result = await searchService.searchBooks('test', {
      maxResults: 10
    });
    
    console.log('Search completed successfully');
    console.log(`Found ${result.results.length} results`);
    console.log(`Search took ${result.searchTime}ms`);
    
    // Test suggestions
    const suggestions = await searchService.getSearchSuggestions('test');
    console.log(`Found ${suggestions.length} suggestions`);
    
    return true;
  } catch (error) {
    console.error('Search test failed:', error);
    return false;
  }
}

// Run the test
testSearch().then(success => {
  if (success) {
    console.log('✅ Search functionality test passed');
  } else {
    console.log('❌ Search functionality test failed');
  }
});