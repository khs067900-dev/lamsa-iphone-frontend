import { chromium } from 'playwright';

const results = {
  status: 'UNKNOWN',
  build: {},
  network: {},
  console: { errors: [], warnings: [], hydration: [] },
  functional: {},
  performance: {},
  productFetch: {},
  runs: []
};

async function runTest(runNumber = 1) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const runResult = {
    runNumber,
    requests: [],
    timing: {},
    errors: [],
    warnings: []
  };

  // Capture console messages
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    
    if (type === 'error') {
      runResult.errors.push(text);
      results.console.errors.push(`[Run ${runNumber}] ${text}`);
    } else if (type === 'warning') {
      runResult.warnings.push(text);
      results.console.warnings.push(`[Run ${runNumber}] ${text}`);
    }
    
    // Check for hydration errors
    if (text.includes('Hydration') || text.includes('hydration') || 
        text.includes('did not match') || text.includes('Expected server')) {
      results.console.hydration.push(`[Run ${runNumber}] ${text}`);
    }
  });

  // Capture network requests
  page.on('request', request => {
    runResult.requests.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType()
    });
  });

  page.on('response', response => {
    const req = runResult.requests.find(r => r.url === response.url());
    if (req) {
      req.status = response.status();
      req.size = response.headers()['content-length'] || 0;
    }
  });

  // Navigate and wait for network idle
  const startTime = Date.now();
  await page.goto('http://localhost:3000', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  const navTime = Date.now() - startTime;
  runResult.timing.navigation = navTime;

  // Get performance metrics
  const performanceMetrics = await page.evaluate(() => {
    const perfData = performance.getEntriesByType('navigation')[0];
    const paintEntries = performance.getEntriesByType('paint');
    
    return {
      ttfb: perfData ? Math.round(perfData.responseStart) : null,
      domContentLoaded: perfData ? Math.round(perfData.domContentLoadedEventEnd) : null,
      loadComplete: perfData ? Math.round(perfData.loadEventEnd) : null,
      fcp: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || null,
      transferSize: perfData ? perfData.transferSize : null
    };
  });
  runResult.timing = { ...runResult.timing, ...performanceMetrics };

  // Get LCP
  try {
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(Math.round(lastEntry.renderTime || lastEntry.loadTime));
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        setTimeout(() => resolve(null), 5000);
      });
    });
    runResult.timing.lcp = lcp;
  } catch (e) {
    runResult.timing.lcp = null;
  }

  // Test functional elements
  runResult.functional = {
    navbar: await page.locator('nav').count() > 0,
    whatsappButton: await page.locator('a[href*="wa.me"]').count() > 0,
    products: await page.locator('[class*="product"], [class*="Product"]').count(),
    banner: await page.locator('section').first().isVisible(),
    searchInput: await page.locator('input[type="text"][placeholder*="بحث"], input[placeholder*="ابحث"]').count() > 0
  };

  // Test search functionality
  if (runResult.functional.searchInput) {
    const searchInput = page.locator('input[type="text"][placeholder*="بحث"], input[placeholder*="ابحث"]').first();
    const requestsBefore = runResult.requests.length;
    
    await searchInput.click();
    await searchInput.fill('iphone');
    await page.waitForTimeout(500);
    
    const requestsAfter = runResult.requests.length;
    runResult.functional.searchTriggersRequest = requestsAfter > requestsBefore;
  }

  await browser.close();
  return runResult;
}

async function runMultipleTests(count = 3) {
  console.log(`Running ${count} test iterations...\n`);
  
  for (let i = 1; i <= count; i++) {
    console.log(`Run ${i}/${count}...`);
    const result = await runTest(i);
    results.runs.push(result);
  }
}

async function analyzeResults() {
  console.log('\n=== ANALYZING RESULTS ===\n');
  
  // Aggregate network data
  const allRequests = results.runs.flatMap(r => r.requests);
  const uniqueUrls = [...new Set(allRequests.map(r => r.url))];
  
  results.network.totalRequests = allRequests.length / results.runs.length;
  results.network.uniqueUrls = uniqueUrls.length;
  
  // Categorize requests
  const apiRequests = uniqueUrls.filter(url => url.includes('/api/'));
  const jsRequests = uniqueUrls.filter(url => url.endsWith('.js'));
  const cssRequests = uniqueUrls.filter(url => url.endsWith('.css'));
  const imageRequests = uniqueUrls.filter(url => /\.(png|jpg|jpeg|webp|svg|gif)/.test(url));
  const fontRequests = uniqueUrls.filter(url => /\.(woff|woff2|ttf)/.test(url));
  
  results.network.breakdown = {
    api: apiRequests.length,
    js: jsRequests.length,
    css: cssRequests.length,
    images: imageRequests.length,
    fonts: fontRequests.length
  };
  
  results.network.apiEndpoints = apiRequests;
  
  // Check for /api/company client fetch
  const companyFetch = allRequests.find(r => 
    r.url.includes('/api/company') && 
    r.resourceType === 'fetch'
  );
  results.network.clientSideCompanyFetch = !!companyFetch;
  
  // Check for duplicate requests
  const requestCounts = {};
  allRequests.forEach(r => {
    requestCounts[r.url] = (requestCounts[r.url] || 0) + 1;
  });
  results.network.duplicates = Object.entries(requestCounts)
    .filter(([url, count]) => count > results.runs.length)
    .map(([url, count]) => ({ url, count: count / results.runs.length }));
  
  // Performance averages
  const timings = results.runs.map(r => r.timing);
  results.performance = {
    ttfb: {
      min: Math.min(...timings.map(t => t.ttfb).filter(Boolean)),
      max: Math.max(...timings.map(t => t.ttfb).filter(Boolean)),
      avg: Math.round(timings.reduce((sum, t) => sum + (t.ttfb || 0), 0) / timings.length)
    },
    fcp: {
      min: Math.min(...timings.map(t => t.fcp).filter(Boolean)),
      max: Math.max(...timings.map(t => t.fcp).filter(Boolean)),
      avg: Math.round(timings.reduce((sum, t) => sum + (t.fcp || 0), 0) / timings.length)
    },
    lcp: {
      min: Math.min(...timings.map(t => t.lcp).filter(Boolean)),
      max: Math.max(...timings.map(t => t.lcp).filter(Boolean)),
      avg: Math.round(timings.reduce((sum, t) => sum + (t.lcp || 0), 0) / timings.length)
    },
    navigation: {
      min: Math.min(...timings.map(t => t.navigation)),
      max: Math.max(...timings.map(t => t.navigation)),
      avg: Math.round(timings.reduce((sum, t) => sum + t.navigation, 0) / timings.length)
    }
  };
  
  // Functional tests
  const functionalResults = results.runs[0].functional;
  results.functional = {
    navbar: functionalResults.navbar ? 'PASS' : 'FAIL',
    whatsappButton: functionalResults.whatsappButton ? 'PASS' : 'FAIL',
    banner: functionalResults.banner ? 'PASS' : 'FAIL',
    searchInput: functionalResults.searchInput ? 'PASS' : 'FAIL',
    searchWorks: functionalResults.searchTriggersRequest ? 'PASS' : 'FAIL',
    productsDisplayed: functionalResults.products
  };
  
  // Overall status
  const hasErrors = results.console.errors.length > 0;
  const hasHydrationErrors = results.console.hydration.length > 0;
  const functionalPass = Object.values(results.functional).every(v => v === 'PASS' || typeof v === 'number');
  
  if (hasErrors || hasHydrationErrors) {
    results.status = 'FAIL';
  } else if (functionalPass) {
    results.status = 'PASS';
  } else {
    results.status = 'PARTIAL';
  }
}

function printReport() {
  console.log('\n' + '='.repeat(80));
  console.log('HOMEPAGE TEST REPORT - AUTOMATED BROWSER TESTING');
  console.log('='.repeat(80) + '\n');
  
  console.log(`STATUS: ${results.status}\n`);
  
  console.log('CONSOLE:');
  console.log(`  Errors: ${results.console.errors.length}`);
  if (results.console.errors.length > 0) {
    results.console.errors.forEach(e => console.log(`    - ${e}`));
  }
  console.log(`  Warnings: ${results.console.warnings.length}`);
  console.log(`  Hydration Errors: ${results.console.hydration.length}`);
  if (results.console.hydration.length > 0) {
    results.console.hydration.forEach(e => console.log(`    - ${e}`));
  }
  console.log();
  
  console.log('NETWORK:');
  console.log(`  Total Requests (avg): ${results.network.totalRequests.toFixed(1)}`);
  console.log(`  Unique URLs: ${results.network.uniqueUrls}`);
  console.log(`  Breakdown:`);
  console.log(`    API: ${results.network.breakdown.api}`);
  console.log(`    JS: ${results.network.breakdown.js}`);
  console.log(`    CSS: ${results.network.breakdown.css}`);
  console.log(`    Images: ${results.network.breakdown.images}`);
  console.log(`    Fonts: ${results.network.breakdown.fonts}`);
  console.log(`  Client-side /api/company fetch: ${results.network.clientSideCompanyFetch ? 'YES ❌' : 'NO ✅'}`);
  console.log(`  Duplicate requests: ${results.network.duplicates.length}`);
  if (results.network.duplicates.length > 0) {
    results.network.duplicates.forEach(d => console.log(`    - ${d.url} (${d.count}x)`));
  }
  console.log('\n  API Endpoints:');
  results.network.apiEndpoints.forEach(url => console.log(`    - ${url}`));
  console.log();
  
  console.log('PERFORMANCE (ms):');
  console.log(`  TTFB:       min=${results.performance.ttfb.min}, max=${results.performance.ttfb.max}, avg=${results.performance.ttfb.avg}`);
  console.log(`  FCP:        min=${results.performance.fcp.min}, max=${results.performance.fcp.max}, avg=${results.performance.fcp.avg}`);
  console.log(`  LCP:        min=${results.performance.lcp.min}, max=${results.performance.lcp.max}, avg=${results.performance.lcp.avg}`);
  console.log(`  Navigation: min=${results.performance.navigation.min}, max=${results.performance.navigation.max}, avg=${results.performance.navigation.avg}`);
  console.log();
  
  console.log('FUNCTIONAL TESTS:');
  console.log(`  Navbar: ${results.functional.navbar}`);
  console.log(`  WhatsappButton: ${results.functional.whatsappButton}`);
  console.log(`  Banner: ${results.functional.banner}`);
  console.log(`  Search Input: ${results.functional.searchInput}`);
  console.log(`  Search Works: ${results.functional.searchWorks}`);
  console.log(`  Products Displayed: ${results.functional.productsDisplayed}`);
  console.log();
  
  console.log('='.repeat(80));
}

// Run tests
await runMultipleTests(3);
await analyzeResults();
printReport();

// Save results to file
import { writeFileSync } from 'fs';
writeFileSync('test-results.json', JSON.stringify(results, null, 2));
console.log('\nResults saved to test-results.json');

process.exit(results.status === 'PASS' ? 0 : 1);
