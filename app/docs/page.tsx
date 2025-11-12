import { readdir, readFile } from "fs/promises";
import { join } from "path";
import Link from "next/link";

interface DocFile {
  name: string;
  path: string;
  slug: string;
}

async function walkDirectory(dir: string, baseDir: string = dir): Promise<DocFile[]> {
  const files: DocFile[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      const subFiles = await walkDirectory(fullPath, baseDir);
      files.push(...subFiles);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      const relativePath = fullPath.replace(baseDir + "/", "");
      const slug = relativePath
        .replace(/\.md$/, "")
        .replace(/\//g, "-")
        .replace(/ /g, "-");
      
      files.push({
        name: entry.name.replace(".md", ""),
        path: relativePath,
        slug: encodeURIComponent(slug),
      });
    }
  }
  
  return files;
}

async function getDocsFiles(): Promise<DocFile[]> {
  const docsDir = join(process.cwd(), "docs");
  
  try {
    const docFiles = await walkDirectory(docsDir, docsDir);
    
    return docFiles.sort((a, b) => {
      // Sort Welcome.md first, then numbered files, then others
      if (a.name === "Welcome") return -1;
      if (b.name === "Welcome") return 1;
      
      const aNum = parseInt(a.name) || Infinity;
      const bNum = parseInt(b.name) || Infinity;
      
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      if (!isNaN(aNum)) return -1;
      if (!isNaN(bNum)) return 1;
      
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error("Error reading docs directory:", error);
    return [];
  }
}

export default async function DocsPage() {
  const docs = await getDocsFiles();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Dokumentáció
          </h1>
          <p className="text-gray-600">
            tinicoach MVP - Fejlesztői dokumentáció
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((doc) => {
            // Use decoded slug in href - Next.js Link handles encoding automatically
            // But we need to match what generateStaticParams returns (decoded)
            const decodedSlug = decodeURIComponent(doc.slug);
            return (
              <Link
                key={doc.slug}
                href={`/docs/${decodedSlug}`}
                className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-500"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {doc.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {doc.path}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

