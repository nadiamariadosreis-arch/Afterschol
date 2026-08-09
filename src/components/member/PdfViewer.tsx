export function PdfViewer({ src, title }: { src: string; title: string }) {
  return (
    <div className="border border-line rounded-sm overflow-hidden bg-card">
      <iframe src={src} title={title} className="w-full h-[75vh]" />
    </div>
  );
}
