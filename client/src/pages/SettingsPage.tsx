import React from "react";
import { motion } from "framer-motion";
import { Settings, Keyboard, Info, RotateCcw, Eye, Save, Sparkles, Trash2 } from "lucide-react";
import { useSettingsStore, useI18n } from "../hooks";
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



import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/auth";

const SettingsPage = () => {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { user, updateAuth } = useAuthStore();
  const { t } = useI18n();
  
  // Throttle AI Config update to avoid too many requests while typing
  const handleUpdateAiConfig = async (key: string, value: string) => {
    if (!user) return;
    
    // Optimistic update in UI
    const newUser = {
      ...user,
      aiConfig: {
        ...(user.aiConfig || {}),
        [key]: value
      }
    };
    updateAuth(newUser);

    try {
      await authApi.updateMe({ aiConfig: { [key]: value } });
    } catch (e) {
      toast.error('Lỗi khi lưu cấu hình AI');
    }
  };

  const handleReset = () => {
    resetSettings();
    toast.success("Đã khôi phục cài đặt mặc định");
  };

  const [editingShortcut, setEditingShortcut] = React.useState<string | null>(null);
  const [tempLanguage, setTempLanguage] = React.useState<"vi" | "en">(settings.language);

  const keyboardShortcuts = [
    { id: "CREATE_NOTE", key: settings.shortcuts?.CREATE_NOTE || "Alt+N", description: "Tạo ghi chú mới", category: "Ghi chú" },
    { id: "SEARCH", key: settings.shortcuts?.SEARCH || "Alt+F", description: "Mở tìm kiếm", category: "Tìm kiếm" },
    { id: "TOGGLE_SIDEBAR", key: settings.shortcuts?.TOGGLE_SIDEBAR || "Alt+B", description: "Mở/đóng sidebar", category: "Giao diện" },
    { id: "TOGGLE_THEME", key: settings.shortcuts?.TOGGLE_THEME || "Alt+D", description: "Chuyển đổi chế độ sáng/tối", category: "Giao diện" },
    { id: "IMPORT", key: settings.shortcuts?.IMPORT || "Alt+I", description: "Nhập file", category: "Ghi chú" },
    { id: "GO_HOME", key: settings.shortcuts?.GO_HOME || "Alt+H", description: "Về trang chủ", category: "Điều hướng" },
    { id: "ESCAPE", key: "Escape", description: "Đóng modal/hộp thoại", category: "Điều hướng" },
    { id: "ENTER", key: "Enter", description: "Thêm tag (trong ô nhập tag)", category: "Ghi chú" },
  ];

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

  const handleShortcutKeyDown = (id: string, e: React.KeyboardEvent) => {
    if (id === "ESCAPE" || id === "ENTER") return; // Non-editable
    e.preventDefault();
    e.stopPropagation();

    if (e.key === "Escape") {
      setEditingShortcut(null);
      return;
    }

    // Require a modifier and a main key
    const modifiers = [];
    if (e.ctrlKey) modifiers.push("Ctrl");
    if (e.altKey) modifiers.push("Alt");
    if (e.shiftKey) modifiers.push("Shift");

    const key = e.key.toUpperCase();
    if (["CONTROL", "ALT", "SHIFT", "META"].includes(key)) return;

    if (modifiers.length > 0) {
      const newShortcut = [...modifiers, key].join("+");
      updateSettings({
        shortcuts: {
          ...settings.shortcuts,
          [id]: newShortcut
        }
      });
      setEditingShortcut(null);
      toast.success("Đã cập nhật phím tắt");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">{t("app.settings")}</h1>
      </div>

      {/* Account Settings */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t("settings.account")}
          </CardTitle>
          <CardDescription>
            {t("settings.account_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {!user?.googleId && (
              <Button variant="outline" className="gap-2 w-full md:w-auto" onClick={() => toast(t("settings.link_google_dev"))}>
                {t("settings.link_google")}
              </Button>
            )}
            
            <Button variant="destructive" className="gap-2 w-full md:w-auto" onClick={() => toast(t("settings.delete_account_dev"))}>
              {t("settings.delete_account")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            {t("settings.app")}
          </CardTitle>
          <CardDescription>
            {t("settings.app_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appName">{t("settings.app_name")}</Label>
            <Input
              id="appName"
              value={settings.appName}
              onChange={(e) => updateSettings({ appName: e.target.value })}
              placeholder="NoteSYS"
              className="max-w-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">{t("settings.welcome")}</Label>
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
            <Label htmlFor="showWelcome">{t("settings.show_welcome")}</Label>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="language">{t("settings.language")}</Label>
            <div className="flex gap-2">
              <select
                id="language"
                value={tempLanguage}
                onChange={(e) => setTempLanguage(e.target.value as "vi" | "en")}
                className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
              <Button 
                onClick={() => {
                  updateSettings({ language: tempLanguage });
                  toast.success(t("settings.language_update"));
                }}
              >
                {t("settings.save")}
              </Button>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleReset}
            className="mt-4 gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {t("settings.reset")}
          </Button>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t("settings.ai")}
          </CardTitle>
          <CardDescription>
            {t("settings.ai_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 pb-2">
            <Switch
              id="aiEnabled"
              checked={settings.aiEnabled}
              onCheckedChange={(checked) =>
                updateSettings({ aiEnabled: checked })
              }
            />
            <Label htmlFor="aiEnabled">{t("settings.enable_ai")}</Label>
          </div>

          {settings.aiEnabled && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="aiProvider">Nhà cung cấp</Label>
            <select
              id="aiProvider"
              value={user?.aiConfig?.provider || 'default'}
              onChange={(e) => handleUpdateAiConfig('provider', e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="default">Mặc định hệ thống</option>
              <option value="xkiro">Xkiro</option>
              <option value="9router">9Router</option>
              <option value="openrouter">OpenRouter</option>
            </select>
          </div>

          {user?.aiConfig?.provider && user.aiConfig.provider !== 'default' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="aiApiKey">API Key</Label>
                <Input
                  id="aiApiKey"
                  type="password"
                  value={user?.aiConfig?.apiKey || ''}
                  onChange={(e) => handleUpdateAiConfig('apiKey', e.target.value)}
                  placeholder="Nhập API Key của bạn..."
                  className="max-w-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aiModel">Tên Model (vd: gpt-4o, claude-3...)</Label>
                <Input
                  id="aiModel"
                  value={user?.aiConfig?.model || ''}
                  onChange={(e) => handleUpdateAiConfig('model', e.target.value)}
                  placeholder="Nhập tên Model..."
                  className="max-w-md"
                />
              </div>
            </>
          )}
          </div>
          )}
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {t("settings.display")}
          </CardTitle>
          <CardDescription>
            {t("settings.display_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("settings.highlight")}</Label>
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
            {t("settings.autosave")}
          </CardTitle>
          <CardDescription>{t("settings.autosave_desc")}</CardDescription>
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
            <Label htmlFor="autoSave">{t("settings.enable_autosave")}</Label>
          </div>

          {settings.autoSave && (
            <div className="space-y-2">
              <Label htmlFor="autoSaveDelay">{t("settings.autosave_delay")}</Label>
              <Input
                id="autoSaveDelay"
                type="number"
                min={30}
                max={3600}
                value={settings.autoSaveDelay / 1000}
                onChange={(e) => {
                  updateSettings({
                    autoSaveDelay: Number(e.target.value) * 1000,
                  });
                }}
                onBlur={(e) => {
                  let val = Number(e.target.value);
                  if (val < 30) val = 30; // Tối thiểu 30s
                  updateSettings({
                    autoSaveDelay: val * 1000,
                  });
                }}
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

      {/* Trash Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            {t("app.trash")}
          </CardTitle>
          <CardDescription>
            {t("settings.trash_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            className="gap-2" 
            onClick={async () => {
              if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn tất cả ghi chú trong thùng rác không? Hành động này không thể hoàn tác.")) {
                try {
                  const { noteApi } = await import("@/api");
                  await noteApi.emptyTrash();
                  toast.success(t("settings.trash_empty"));
                } catch (err) {
                  toast.error(t("settings.trash_error"));
                }
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
            {t("settings.empty_trash")}
          </Button>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts - Only show on desktop */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            {t("settings.shortcuts")}
          </CardTitle>
          <CardDescription>
            {t("settings.shortcuts_desc")}
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
                      key={shortcut.id}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50 cursor-pointer hover:bg-muted"
                      onClick={() => {
                        if (shortcut.id !== "ESCAPE" && shortcut.id !== "ENTER") {
                          setEditingShortcut(shortcut.id);
                        }
                      }}
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      {editingShortcut === shortcut.id ? (
                        <input 
                          autoFocus
                          onBlur={() => setEditingShortcut(null)}
                          onKeyDown={(e) => handleShortcutKeyDown(shortcut.id, e)}
                          className="px-2 py-1 text-xs font-semibold border-primary rounded-md shadow-sm outline-none text-center bg-background w-24"
                          placeholder="Nhấn phím..."
                          readOnly
                        />
                      ) : (
                        <kbd className="px-2 py-1 text-xs font-semibold bg-background border rounded-md shadow-sm" title={shortcut.id !== "ESCAPE" && shortcut.id !== "ENTER" ? "Bấm vào để đổi" : ""}>
                          {shortcut.key}
                        </kbd>
                      )}
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
