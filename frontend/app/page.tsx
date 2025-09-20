import { Navbar } from "@/components/Navbar";
import { PasteViewer } from "@/components/PasteViewer";

const PasteViewPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;

  // The check for `!id` is optional in Next.js because the file-based router
  // ensures an `id` is present for this route to match.
  // We'll keep the PasteViewer component and pass the id.

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <PasteViewer pasteId={id} />
      </div>
    </div>
  );
};

export default PasteViewPage;