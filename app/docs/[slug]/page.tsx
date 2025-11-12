import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
    return docFiles;
  } catch (error) {
    console.error("Error reading docs directory:", error);
    return [];
  }
}

async function getDocContent(slug: string): Promise<{ content: string; name: string } | null> {
  const docs = await getDocsFiles();
  const decodedSlug = decodeURIComponent(slug);
  const doc = docs.find((d) => decodeURIComponent(d.slug) === decodedSlug);
  
  if (!doc) return null;
  
  try {
    // The path is already relative to docs directory
    const filePath = join(process.cwd(), "docs", doc.path);
    const content = await readFile(filePath, "utf-8");
    
    return {
      content,
      name: doc.name,
    };
  } catch (error) {
    console.error(`Error reading file ${doc.path}:`, error);
    return null;
  }
}

export async function generateStaticParams() {
  const docs = await getDocsFiles();
  return docs.map((doc) => ({
    slug: doc.slug,
  }));
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await getDocContent(slug);

  if (!doc) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/docs"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          ← Vissza a dokumentációhoz
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
              {doc.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
}

