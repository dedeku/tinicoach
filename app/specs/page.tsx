import { readdir, readFile } from "fs/promises";
import { join } from "path";
import Link from "next/link";

interface SpecFile {
  name: string;
  path: string;
  slug: string;
}

async function getSpecFiles(): Promise<SpecFile[]> {
  const specsDir = join(process.cwd(), "agent-os", "product");
  
  try {
    const entries = await readdir(specsDir, { withFileTypes: true });
    const files: SpecFile[] = [];
    
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".md")) {
        const slug = entry.name
          .replace(/\.md$/, "")
          .replace(/ /g, "-");
        
        files.push({
          name: entry.name.replace(".md", ""),
          path: entry.name,
          slug: encodeURIComponent(slug),
        });
      }
    }
    
    // Sort: mission first, then roadmap, then tech-stack, then others alphabetically
    return files.sort((a, b) => {
      const order: { [key: string]: number } = {
        mission: 1,
        roadmap: 2,
        "tech-stack": 3,
      };
      
      const aOrder = order[a.name.toLowerCase()] || 99;
      const bOrder = order[b.name.toLowerCase()] || 99;
      
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error("Error reading specs directory:", error);
    return [];
  }
}

// Force static generation
export const dynamic = 'force-static';
export const revalidate = false;

export default async function SpecsPage() {
  const specs = await getSpecFiles();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Agent OS - Product Dokumentáció
          </h1>
          <p className="text-gray-600">
            Product mission, roadmap és tech stack dokumentáció
          </p>
          <div className="mt-4">
            <Link
              href="/docs"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Vissza a fejlesztői dokumentációhoz
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {specs.map((spec) => {
            const decodedSlug = decodeURIComponent(spec.slug);
            return (
              <Link
                key={spec.slug}
                href={`/specs/${decodedSlug}`}
                className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-500"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {spec.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {spec.path}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

