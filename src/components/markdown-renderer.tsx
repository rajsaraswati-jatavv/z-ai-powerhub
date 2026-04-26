"use client";

import { useState, useCallback, type ComponentPropsWithoutRef, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/** ---------------------------------------------------------------------------
 * CopyButton – shown inside code blocks
 * ------------------------------------------------------------------------- */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback – unlikely in modern browsers
      setCopied(false);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "absolute right-3 top-3 z-10 inline-flex items-center justify-center rounded-md p-1.5",
        "text-xs text-muted-foreground transition-colors",
        "hover:bg-white/10 hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      )}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-400" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}

/** ---------------------------------------------------------------------------
 * MarkdownRenderer – full-featured markdown renderer
 * ------------------------------------------------------------------------- */
interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        components={{
          /** Paragraphs */
          p: ({ children }) => (
            <p className="mb-4 leading-7 last:mb-0">{children}</p>
          ),

          /** Headings */
          h1: ({ children }) => (
            <h1 className="mb-4 mt-8 text-3xl font-bold tracking-tight first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-6 text-2xl font-semibold tracking-tight first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-5 text-xl font-semibold tracking-tight first:mt-0">
              {children}
            </h3>
          ),

          /** Lists */
          ul: ({ children }) => (
            <ul className="mb-4 ml-6 list-disc space-y-1 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-6 list-decimal space-y-1 last:mb-0">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-7">{children}</li>
          ),

          /** Blockquote */
          blockquote: ({ children }) => (
            <blockquote className="mb-4 border-l-4 border-primary/30 pl-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),

          /** Links */
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {children}
            </a>
          ),

          /** Inline code */
          code: ({ className, children, ...props }: ComponentPropsWithoutRef<"code"> & { node?: unknown }) => {
            // Detect if this is an inline code (no language class) or a code block child
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            // When inside a <pre> (code block), react-markdown passes className like "language-ts"
            // We handle it in the `pre` component below, but we still need to render something
            // for the <code> element inside <pre>. The SyntaxHighlighter handles the actual rendering.
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },

          /** Code blocks – wrapped in <pre> */
          pre: ({ children }) => {
            // Extract the code content and language from children
            const codeElement = children as ReactNode & {
              props?: {
                className?: string;
                children?: ReactNode;
              };
            };

            const languageMatch = codeElement?.props?.className?.match(/language-(\w+)/);
            const language = languageMatch ? languageMatch[1] : "";
            const codeText = extractTextFromChildren(codeElement?.props?.children);

            return (
              <div className="group/code relative mb-4 mt-2 overflow-hidden rounded-lg border border-border">
                {/* Language label */}
                {language && (
                  <div className="flex items-center justify-between border-b border-border bg-zinc-900 px-4 py-1.5">
                    <span className="text-xs font-medium text-zinc-400">{language}</span>
                  </div>
                )}

                {/* Copy button – positioned inside the code block */}
                <CopyButton text={codeText} />

                <SyntaxHighlighter
                  language={language || "text"}
                  style={oneDark}
                  customStyle={{
                    margin: 0,
                    borderRadius: language ? 0 : "0.5rem",
                    padding: "1rem",
                    fontSize: "0.875rem",
                    lineHeight: "1.7",
                    background: "rgb(30, 30, 36)",
                  }}
                  showLineNumbers={false}
                  wrapLongLines
                >
                  {codeText}
                </SyntaxHighlighter>
              </div>
            );
          },

          /** Tables */
          table: ({ children }) => (
            <div className="mb-4 overflow-x-auto last:mb-0">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-border bg-muted/50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-border px-4 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-border px-4 py-2">{children}</td>
          ),

          /** Horizontal rule */
          hr: () => (
            <hr className="my-6 border-border" />
          ),

          /** Strong & emphasis */
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/** ---------------------------------------------------------------------------
 * Helper – recursively extract plain text from React children
 * ------------------------------------------------------------------------- */
function extractTextFromChildren(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractTextFromChildren).join("");
  if (children && typeof children === "object" && "props" in children) {
    return extractTextFromChildren((children as { props: { children: ReactNode } }).props.children);
  }
  return "";
}

export default MarkdownRenderer;
