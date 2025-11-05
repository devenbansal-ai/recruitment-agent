import { FileText } from "lucide-react";

export function BlankState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-6">
      <FileText className="w-16 h-16 text-slate-400 mb-4" />
      <h2 className="text-xl font-semibold">Ask the Recruitment Agent</h2>
      <p className="text-slate-500 mt-2 max-w-xl">
        Upload your resume and ask questions. The agent will read your
        documents, search the web if necessary, and provide a grounded answer
        with clickable sources.
      </p>
    </div>
  );
}
