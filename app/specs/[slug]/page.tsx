import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
    
    return files;
  } catch (error) {
    console.error("Error reading specs directory:", error);
    return [];
  }
}

async function getSpecContent(slug: string): Promise<{ content: string; name: string } | null> {
  const specs = await getSpecFiles();
  
  // Decode the incoming slug (it may come encoded from generateStaticParams during build)
  let decodedSlug: string;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (e) {
    decodedSlug = slug;
  }
  
  const spec = specs.find((s) => {
    const specSlugDecoded = decodeURIComponent(s.slug);
    return specSlugDecoded === decodedSlug;
  });
  
  if (!spec) {
    console.error(`Spec not found for slug: ${slug} (decoded: ${decodedSlug})`);
    return null;
  }
  
  try {
    const filePath = join(process.cwd(), "agent-os", "product", spec.path);
    const content = await readFile(filePath, "utf-8");
    
    return {
      content,
      name: spec.name,
    };
  } catch (error) {
    console.error(`Error reading file ${spec.path}:`, error);
    return null;
  }
}

// Force static generation
export const dynamic = 'force-static';
export const revalidate = false;

export async function generateStaticParams() {
  const specs = await getSpecFiles();
  return specs.map((spec) => ({
    slug: decodeURIComponent(spec.slug),
  }));
}

export default async function SpecPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const spec = await getSpecContent(slug);

  if (!spec) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/specs"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          ← Vissza a product dokumentációhoz
        </Link>

        <article className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-lg prose-slate max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-4xl font-bold mt-8 mb-4 text-gray-900" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-3xl font-semibold mt-8 mb-3 text-gray-800" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-2xl font-semibold mt-6 mb-2 text-gray-800" {...props} />
                ),
                h4: ({ node, ...props }) => (
                  <h4 className="text-xl font-semibold mt-4 mb-2 text-gray-700" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="mb-4 text-gray-700 leading-7" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2 ml-4" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2 ml-4" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="ml-2 text-gray-700" {...props} />
                ),
                code: ({ node, className, children, ...props }: any) => {
                  const isInline = !className;
                  return isInline ? (
                    <code
                      className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <code
                      className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 text-sm font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                pre: ({ node, children, ...props }: any) => (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4" {...props}>
                    {children}
                  </pre>
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600"
                    {...props}
                  />
                ),
                a: ({ node, href, ...props }: any) => (
                  <a
                    href={href}
                    className="text-blue-600 hover:text-blue-800 underline"
                    {...props}
                  />
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border-collapse border border-gray-300" {...props} />
                  </div>
                ),
                th: ({ node, ...props }) => (
                  <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="border border-gray-300 px-4 py-2" {...props} />
                ),
                hr: ({ node, ...props }) => (
                  <hr className="my-8 border-gray-300" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-gray-900" {...props} />
                ),
                em: ({ node, ...props }) => (
                  <em className="italic" {...props} />
                ),
              }}
            >
              {spec.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
}

