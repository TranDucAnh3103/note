import { motion } from "framer-motion";
import { Settings, Keyboard, Info, RotateCcw, Eye, Save } from "lucide-react";
import { useSettingsStore } from "../store/settingsStore";
import {
  Input,
  Textarea,
  Button,
  Switch,
  Label,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui";
import toast from "react-hot-toast";

const keyboardShortcuts = [
  {
    key: "Ctrl + N",
    description: "Tạo ghi chú mới",
    category: "Ghi chú",
  },
  {
    key: "Ctrl + F",
    description: "Mở tìm kiếm",
    category: "Tìm kiếm",
  },
  {
    key: "Ctrl + B",
    description: "Mở/đóng sidebar",
    category: "Giao diện",
  },
  {
    key: "Ctrl + D",
    description: "Chuyển đổi chế độ sáng/tối",
    category: "Giao diện",
  },
  {
    key: "Escape",
    description: "Đóng modal/hộp thoại",
    category: "Điều hướng",
  },
  {
    key: "Enter",
    description: "Thêm tag (trong ô nhập tag)",
    category: "Ghi chú",
  },
];

const SettingsPage = () => {
  const { settings, updateSettings, resetSettings } = useSettingsStore();

  const handleReset = () => {
    resetSettings();
    toast.success("Đã khôi phục cài đặt mặc định");
  };

  // Group shortcuts by category
  const groupedShortcuts = keyboardShortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {} as Record<string, typeof keyboardShortcuts>,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">Cài đặt</h1>
      </div>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Cài đặt ứng dụng
          </CardTitle>
          <CardDescription>
            Tùy chỉnh tên và thông điệp chào mừng của ứng dụng
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appName">Tên ứng dụng</Label>
            <Input
              id="appName"
              value={settings.appName}
              onChange={(e) => updateSettings({ appName: e.target.value })}
              placeholder="NoteSYS"
              className="max-w-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">Thông điệp chào mừng</Label>
            <Textarea
              id="welcomeMessage"
              value={settings.welcomeMessage}
              onChange={(e) =>
                updateSettings({ welcomeMessage: e.target.value })
              }
              placeholder="Chào mừng bạn đến với ứng dụng ghi chú!"
              className="max-w-md resize-none"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="showWelcome"
              checked={settings.showWelcome}
              onCheckedChange={(checked) =>
                updateSettings({ showWelcome: checked })
              }
            />
            <Label htmlFor="showWelcome">Hiển thị thông điệp chào mừng</Label>
          </div>

          <Button
            variant="outline"
            onClick={handleReset}
            className="mt-4 gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Khôi phục mặc định
          </Button>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Hiển thị
          </CardTitle>
          <CardDescription>
            Tùy chỉnh cách hiển thị ghi chú và tìm kiếm
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Màu tô sáng tìm kiếm</Label>
            <div className="flex gap-2">
              {[
                "#fef08a",
                "#bbf7d0",
                "#bfdbfe",
                "#ddd6fe",
                "#fbcfe8",
                "#fed7aa",
              ].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateSettings({ highlightColor: color })}
                  className={`w-8 h-8 rounded-full transition-all ${
                    settings.highlightColor === color
                      ? "ring-2 ring-offset-2 ring-offset-background ring-primary"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-save Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Tự động lưu
          </CardTitle>
          <CardDescription>Tự động lưu ghi chú khi chỉnh sửa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="autoSave"
              checked={settings.autoSave}
              onCheckedChange={(checked) =>
                updateSettings({ autoSave: checked })
              }
            />
            <Label htmlFor="autoSave">Bật tự động lưu</Label>
          </div>

          {settings.autoSave && (
            <div className="space-y-2">
              <Label htmlFor="autoSaveDelay">Độ trễ tự động lưu (giây)</Label>
              <Input
                id="autoSaveDelay"
                type="number"
                min={1}
                max={30}
                value={settings.autoSaveDelay / 1000}
                onChange={(e) =>
                  updateSettings({
                    autoSaveDelay: Number(e.target.value) * 1000,
                  })
                }
                className="max-w-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                Ghi chú sẽ được lưu sau {settings.autoSaveDelay / 1000} giây
                không thao tác
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts - Only show on desktop */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Phím tắt
          </CardTitle>
          <CardDescription>
            Các phím tắt giúp bạn thao tác nhanh hơn (chỉ hoạt động trên máy
            tính)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
              <div key={category} className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {category}
                </h3>
                <div className="space-y-2">
                  {shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.key}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-background border rounded-md shadow-sm">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mobile notice for keyboard shortcuts */}
      <Card className="md:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Phím tắt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Phím tắt chỉ hoạt động trên máy tính. Vui lòng sử dụng giao diện cảm
            ứng trên thiết bị di động.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SettingsPage;
