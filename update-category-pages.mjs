#!/usr/bin/env node
/**
 * Script to update all category pages to use the new optimized PhoneHeroPageWrapper
 * This eliminates fetch-all-then-filter pattern and uses server-side filtering
 */

import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

const CATEGORIES_DIR = "./app/(categories)";

async function updateFile(filePath) {
  try {
    const content = await readFile(filePath, "utf-8");
    
    // Skip if already using PhoneHeroPageWrapper
    if (content.includes("PhoneHeroPageWrapper")) {
      console.log(`✓ Already updated: ${filePath}`);
      return false;
    }
    
    // Skip if not using PhoneHeroPage
    if (!content.includes("PhoneHeroPage") || !content.includes("getAllProducts")) {
      return false;
    }
    
    let updated = content;
    
    // Replace import
    updated = updated.replace(
      /import PhoneHeroPage from ["'](.+?)["'];/,
      'import PhoneHeroPageWrapper from "$1/PhoneHeroPageWrapper";'
    );
    
    // Remove getAllProducts import
    updated = updated.replace(
      /import \{ getAllProducts \} from ["'].+?["'];\n?/g,
      ""
    );
    
    // Remove const products = await getAllProducts();
    updated = updated.replace(
      /\s*const products = await getAllProducts\(\);\n?/g,
      ""
    );
    
    // Replace PhoneHeroPage with PhoneHeroPageWrapper
    updated = updated.replace(/PhoneHeroPage/g, "PhoneHeroPageWrapper");
    
    // Remove initialProducts prop
    updated = updated.replace(/\s*initialProducts=\{products\}\n?/g, "");
    
    // Clean up extra blank lines
    updated = updated.replace(/\n{3,}/g, "\n\n");
    
    if (updated !== content) {
      await writeFile(filePath, updated, "utf-8");
      console.log(`✓ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`✗ Error updating ${filePath}:`, error.message);
    return false;
  }
}

async function scanDirectory(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const updates = [];
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively scan subdirectories
      const subUpdates = await scanDirectory(fullPath);
      updates.push(...subUpdates);
    } else if (entry.name === "page.tsx") {
      // Update page.tsx files
      const wasUpdated = await updateFile(fullPath);
      if (wasUpdated) {
        updates.push(fullPath);
      }
    }
  }
  
  return updates;
}

async function main() {
  console.log("🚀 Starting category pages update...\n");
  
  try {
    const updatedFiles = await scanDirectory(CATEGORIES_DIR);
    
    console.log(`\n✅ Done! Updated ${updatedFiles.length} file(s).`);
    
    if (updatedFiles.length > 0) {
      console.log("\nUpdated files:");
      updatedFiles.forEach(file => console.log(`  - ${file}`));
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
