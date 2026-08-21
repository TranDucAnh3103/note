import { useState, useRef } from "react";
import { Upload, X, FileText } from "lucide-react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui";
import { useImportModalStore } from "@/store";
import { useFolders, useCreateNote } from "@/hooks";
import { parseImportedFile } from "@/utils/importNote";

export default function ImportNoteModal() {
  const { isOpen, targetFolderId, closeModal } = useImportModalStore();
  const { data: folders } = useFolders();
  const createNote = useCreateNote();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>(targetFolderId || "");
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).filter(
        (f) => f.name.endsWith(".md") || f.name.endsWith(".txt")
      );
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    if (files.length === 0) return;
    setIsImporting(true);
    let successCount = 0;
    
    try {
      for (const file of files) {
        const { title, content, tags } = await parseImportedFile(file);
        await createNote.mutateAsync({
          title,
          content,
          tags,
          folderId: selectedFolderId || null,
        });
        successCount++;
      }
      toast.success(`Đã import thành công ${successCount} ghi chú`);
      setFiles([]);
      closeModal();
    } catch (error) {
      toast.error("Lỗi trong quá trình import");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nhập ghi chú từ file</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Thư mục đích</label>
            <select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Không có thư mục</option>
              {folders?.map((folder) => (
                <option key={folder._id} value={folder._id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          <div
            className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm font-medium">Nhấn hoặc kéo thả file vào đây</p>
            <p className="text-xs text-muted-foreground mt-1">
              Hỗ trợ file .txt và .md
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept=".txt,.md"
              onChange={handleFileChange}
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
              <label className="text-sm font-medium">File đã chọn:</label>
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeModal} disabled={isImporting}>
            Hủy
          </Button>
          <Button
            onClick={handleImport}
            disabled={files.length === 0 || isImporting}
          >
            {isImporting ? "Đang xử lý..." : "Nhập (Import)"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
