import { readdir, readFile } from "fs/promises";
import { join } from "path";
import Link from "next/link";

interface DocFile {
  name: string;
  path: string;
  slug: string;
}

async function getDocsFiles(): Promise<DocFile[]> {
  const docsDir = join(process.cwd(), "docs");
  
  try {
    const files = await readdir(docsDir, { recursive: true, withFileTypes: true });
    
    const docFiles: DocFile[] = [];
    
    for (const file of files) {
      if (file.isFile() && file.name.endsWith(".md")) {
        // Get relative path from docs directory
        // file.parentPath contains full path, we need relative part
        let relativePath: string;
        if (file.parentPath) {
          // Extract relative path by removing docsDir prefix
          const parentRelative = file.parentPath.startsWith(docsDir)
            ? file.parentPath.substring(docsDir.length + 1)
            : file.parentPath;
          relativePath = parentRelative ? `${parentRelative}/${file.name}` : file.name;
        } else {
          relativePath = file.name;
        }
        
        // Create slug: replace / with -, remove .md, handle special chars
        const slug = relativePath
          .replace(/\.md$/, "")
          .replace(/\//g, "-")
          .replace(/ /g, "-");
        
        docFiles.push({
          name: file.name.replace(".md", ""),
          path: relativePath,
          slug: encodeURIComponent(slug),
        });
      }
    }
    
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
          {docs.map((doc) => (
            <Link
              key={doc.slug}
              href={`/docs/${doc.slug}`}
              className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-500"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {doc.name}
              </h2>
              <p className="text-sm text-gray-500">
                {doc.path.replace("docs/", "")}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

