import { Note } from "@/types";
import toast from "react-hot-toast";

/**
 * Tạo file và tải xuống
 */
const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Xử lý tên file an toàn
 */
const getSafeFilename = (title: string, extension: string) => {
  const safeName = title.replace(/[^a-zA-Z0-9\u00C0-\u1EF9\s]/g, "").trim() || "note";
  return `${safeName}.${extension}`;
};

/**
 * Xuất note ra định dạng TXT
 */
export const exportAsTxt = (note: Note) => {
  try {
    const content = `${note.title}\n${"-".repeat(note.title.length)}\n\n${note.content || ""}\n\n---\nThẻ: ${note.tags.join(", ") || "Không có"}\nCập nhật: ${new Date(note.updatedAt).toLocaleString("vi-VN")}`;
    
    downloadFile(content, getSafeFilename(note.title, "txt"), "text/plain;charset=utf-8");
    toast.success("Đã xuất file TXT");
  } catch (error) {
    console.error("Export error:", error);
    toast.error("Lỗi khi xuất file");
  }
};

/**
 * Xuất note ra định dạng Markdown (.md) có frontmatter
 */
export const exportAsMd = (note: Note) => {
  try {
    const folderName = typeof note.folderId === "object" ? note.folderId?.name : "None";
    
    // Tạo YAML Frontmatter
    const frontmatter = `---
title: "${note.title.replace(/"/g, '\\"')}"
date: ${new Date(note.createdAt).toISOString()}
updated: ${new Date(note.updatedAt).toISOString()}
tags: [${note.tags.map(t => `"${t}"`).join(", ")}]
folder: "${folderName || 'None'}"
---

`;

    const content = `${frontmatter}${note.content || ""}`;
    
    downloadFile(content, getSafeFilename(note.title, "md"), "text/markdown;charset=utf-8");
    toast.success("Đã xuất file Markdown");
  } catch (error) {
    console.error("Export error:", error);
    toast.error("Lỗi khi xuất file");
  }
};
