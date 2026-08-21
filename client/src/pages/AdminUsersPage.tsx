import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { Users, UserX, UserCheck, Shield } from "lucide-react";
import { authApi } from "@/api/auth";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from "@/components/ui";
import toast from "react-hot-toast";
import { useI18n } from "@/hooks";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  const loadUsers = async () => {
    try {
      const res: any = await authApi.getUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (e) {
      toast.error(t("admin.error_load"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    try {
      await authApi.updateUser(id, { status: newStatus });
      toast.success(t("admin.status_update_success"));
      loadUsers();
    } catch (e) {
      toast.error(t("admin.status_update_error"));
    }
  };

  const handleUpdateRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await authApi.updateUser(id, { role: newRole });
      toast.success(t("admin.role_update_success"));
      loadUsers();
    } catch (e) {
      toast.error(t("admin.role_update_error"));
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">{t("admin.users")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.users_list")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">{t("loading")}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">{t("admin.name")}</th>
                    <th className="px-4 py-3">{t("admin.email")}</th>
                    <th className="px-4 py-3">{t("admin.role")}</th>
                    <th className="px-4 py-3">{t("admin.status")}</th>
                    <th className="px-4 py-3 rounded-tr-lg">{t("admin.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{user.username}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.status === "ACTIVE" ? "outline" : "destructive"}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateRole(user._id, user.role)}
                            className="h-8 px-2"
                            title={user.role === "admin" ? t("admin.remove_admin") : t("admin.make_admin")}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={user.status === "ACTIVE" ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => handleUpdateStatus(user._id, user.status)}
                            className="h-8 px-2"
                            title={user.status === "ACTIVE" ? t("admin.block") : t("admin.unblock")}
                          >
                            {user.status === "ACTIVE" ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
