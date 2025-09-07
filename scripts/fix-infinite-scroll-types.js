#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const files = [
  'src/components/ui/OptimizedDataList.tsx',
  'src/components/ui/OptimizedDataProvider.tsx',
  'src/components/ui/OptimizedDataSystem.tsx',
  'src/components/ui/OptimizedDataManager.tsx'
];

const fixInfiniteScrollTypes = (filePath) => {
  if (!fs.existsSync(filePath)) {
    console.log(`File ${filePath} does not exist, skipping...`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file contains OptimizedInfiniteScroll with renderItem
  if (content.includes('OptimizedInfiniteScroll') && content.includes('renderItem={renderItem}')) {
    console.log(`Fixing ${filePath}...`);
    
    // Replace the infinite scroll block
    const infiniteScrollPattern = /(\s*\/\/ Бесконечная прокрутка\s*\n\s*if \(infiniteScroll\) \{\s*\n\s*return \(\s*\n\s*<OptimizedInfiniteScroll\s*\n\s*data=\{data\}\s*\n\s*hasMore=\{infiniteScroll\.hasMore\}\s*\n\s*loading=\{loading\}\s*\n\s*onLoadMore=\{infiniteScroll\.onLoadMore\}\s*\n\s*renderItem=\{renderItem\}\s*\n\s*error=\{error\}\s*\n\s*onRetry=\{onRetry\}\s*\n\s*\/>\s*\n\s*\)\s*\n\s*\}\)/g;
    
    const replacement = `    // Бесконечная прокрутка
    if (infiniteScroll) {
      const renderItemWrapper = (item: unknown, index: number) => {
        return renderItem(item as T, index)
      }
      
      return (
        <OptimizedInfiniteScroll
          data={data}
          hasMore={infiniteScroll.hasMore}
          loading={loading}
          onLoadMore={infiniteScroll.onLoadMore}
          renderItem={renderItemWrapper}
          error={error}
          onRetry={onRetry}
        />
      )
    }`;
    
    content = content.replace(infiniteScrollPattern, replacement);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
  } else {
    console.log(`No infinite scroll issues found in ${filePath}`);
  }
};

// Process all files
files.forEach(fixInfiniteScrollTypes);

console.log('🎉 All files processed!');
