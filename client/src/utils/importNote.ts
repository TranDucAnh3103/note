/**
 * Phân tích file văn bản để trích xuất tiêu đề, nội dung, và thẻ
 */
export const parseImportedFile = async (file: File): Promise<{ title: string; content: string; tags: string[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const filename = file.name.replace(/\.[^/.]+$/, ""); // Bỏ extension
        
        let title = filename;
        let content = text;
        let tags: string[] = [];

        // Parse markdown frontmatter nếu có
        if (file.name.endsWith(".md") && text.startsWith("---")) {
          const endFrontmatterIndex = text.indexOf("---", 3);
          if (endFrontmatterIndex !== -1) {
            const frontmatter = text.substring(3, endFrontmatterIndex);
            content = text.substring(endFrontmatterIndex + 3).trim();

            // Extract title
            const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/);
            if (titleMatch) title = titleMatch[1];

            // Extract tags
            const tagsMatch = frontmatter.match(/tags:\s*\[(.*?)\]/);
            if (tagsMatch) {
              tags = tagsMatch[1]
                .split(",")
                .map((t) => t.trim().replace(/"/g, ""))
                .filter(Boolean);
            }
          }
        } else if (file.name.endsWith(".txt")) {
          // Parse file txt (lấy dòng đầu làm title nếu nó kết thúc bằng \n\n)
          const lines = text.split("\n");
          if (lines.length > 2 && lines[1].startsWith("---")) {
            title = lines[0].trim();
            content = lines.slice(2).join("\n").trim();
            
            // Tìm footer tags
            const tagsMatch = content.match(/Thẻ:\s*(.+)$/m);
            if (tagsMatch) {
              tags = tagsMatch[1].split(",").map(t => t.trim()).filter(t => t !== "Không có");
              // Xóa footer
              content = content.replace(/---\nThẻ:.*\nCập nhật:.*/s, "").trim();
            }
          }
        }

        resolve({ title, content, tags });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Không thể đọc file"));
    reader.readAsText(file);
  });
};
