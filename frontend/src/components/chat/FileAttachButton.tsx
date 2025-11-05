import { useRef } from "react";
import { Paperclip } from "lucide-react";

export default function FileAttachButton({
  onFileSelect,
  file,
}: {
  onFileSelect: (file: File) => void;
  file: File | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click(); // trigger hidden input
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <span className="relative flex items-center">
      {file && <span>{file.name}</span>}
      <button
        type="button"
        onClick={handleClick}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Attach file"
      >
        <Paperclip className="h-5 w-5 text-gray-500" />
      </button>

      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={handleFileChange}
      />
    </span>
  );
}
