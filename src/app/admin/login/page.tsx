import { AppWindow } from "@/features/xp/window";
import { LoginForm } from "@/features/admin/login/components/login-form";

export default function AdminLoginPage() {
  return (
    <AppWindow title="Log On to SHTX Voting" variant="dialog">
      <LoginForm />
    </AppWindow>
  );
}
