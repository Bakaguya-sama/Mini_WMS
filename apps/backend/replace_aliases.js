const fs = require('fs');
const path = require('path');

function getRelativePath(fromFile, toAlias) {
  // fromFile: e.g. D:\...\src\modules\auth\auth.controller.ts
  // toAlias: e.g. @/shared/errors/AppError
  
  const srcDir = path.join(__dirname, 'src');
  const fromDir = path.dirname(fromFile);
  
  // Convert @/ to absolute path in src
  const toAbsolute = path.join(srcDir, toAlias.replace(/^@\//, ''));
  
  // Get relative path
  let relPath = path.relative(fromDir, toAbsolute);
  
  // Replace backslashes with forward slashes for TS imports
  relPath = relPath.replace(/\\/g, '/');
  
  // Ensure it starts with ./ or ../
  if (!relPath.startsWith('.')) {
    relPath = './' + relPath;
  }
  
  return relPath;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Regex to match imports: import ... from "@/..."
      const regex = /from\s+["']@\/(.*?)["']/g;
      
      let modified = false;
      content = content.replace(regex, (match, p1) => {
        modified = true;
        const rel = getRelativePath(fullPath, '@/' + p1);
        return `from "${rel}"`;
      });
      
      // Also match dynamic imports or require: import("@/...")
      const regex2 = /import\s*\(\s*["']@\/(.*?)["']\s*\)/g;
      content = content.replace(regex2, (match, p1) => {
        modified = true;
        const rel = getRelativePath(fullPath, '@/' + p1);
        return `import("${rel}")`;
      });
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src'));
console.log("Done replacing aliases!");
