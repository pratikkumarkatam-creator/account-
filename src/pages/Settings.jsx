import { LogOut, Lock, Save, ShieldCheck, User, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { FormField, Input, Select } from "../components/ui/Form";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { api } from "../services/api";
import { formatDate, initials } from "../utils/format";

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  const [preferences, setPreferences] = useState({
    default_statement_range: user?.preferences?.default_statement_range || "30",
    show_charts: user?.preferences?.show_charts !== false,
  });
  const [savingPreferences, setSavingPreferences] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPreferences({
        default_statement_range: user.preferences?.default_statement_range || "30",
        show_charts: user.preferences?.show_charts !== false,
      });
    }
  }, [user]);

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required", "Enter the name you want shown in the app.");
      return;
    }

    setSavingProfile(true);
    try {
      const data = await api.updateProfile({ name: name.trim() });
      updateUser(data.user);
      toast.success("Profile updated", "Your display name has been saved.");
    } catch (error) {
      toast.error("Could not update profile", error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!passwords.current_password) nextErrors.current_password = "Current password is required.";
    if (!passwords.new_password) nextErrors.new_password = "New password is required.";
    else if (passwords.new_password.length < 6) {
      nextErrors.new_password = "Use at least 6 characters.";
    }
    if (passwords.confirm_password !== passwords.new_password) {
      nextErrors.confirm_password = "Passwords do not match.";
    }

    setPasswordErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSavingPassword(true);
    try {
      await api.updatePassword({
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      });
      setPasswords({ current_password: "", new_password: "", confirm_password: "" });
      toast.success("Password updated", "Use the new password the next time you sign in.");
    } catch (error) {
      if (error.fields) setPasswordErrors(error.fields);
      toast.error("Could not change password", error.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const savePreferences = async (event) => {
    event.preventDefault();
    setSavingPreferences(true);
    try {
      const data = await api.updatePreferences(preferences);
      updateUser({ ...user, preferences: data.preferences });
      toast.success("Preferences saved", "Your defaults will apply the next time you sign in.");
    } catch (error) {
      toast.error("Could not save preferences", error.message);
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your profile, password and statement defaults."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-base font-semibold text-white">
              {initials(user?.name)}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-ink">{user?.name}</h2>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-slate-500">@{user?.username}</span>
                <Badge tone={user?.role === "admin" ? "info" : "warning"}>
                  <ShieldCheck size={11} /> {user?.role}
                </Badge>
              </div>
            </div>
          </div>

          <form onSubmit={saveProfile} className="mt-5 space-y-4">
            <FormField label="Display name" htmlFor="profile_name" required>
              <Input
                id="profile_name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
              />
            </FormField>

            <FormField label="Username" htmlFor="profile_username" hint="Usernames cannot be changed in this demo.">
              <Input id="profile_username" value={user?.username || ""} disabled />
            </FormField>

            <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-3 text-xs">
              <div>
                <p className="text-slate-400">Access level</p>
                <p className="mt-0.5 font-semibold capitalize text-ink">{user?.role}</p>
              </div>
              <div>
                <p className="text-slate-400">Member since</p>
                <p className="mt-0.5 font-semibold text-ink">{formatDate(user?.created_at)}</p>
              </div>
            </div>

            <Button type="submit" icon={Save} loading={savingProfile}>
              Save profile
            </Button>
          </form>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-ink">Change password</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Passwords are hashed with PBKDF2 before they are stored.
          </p>

          <form onSubmit={changePassword} className="mt-5 space-y-4">
            <FormField
              label="Current password"
              htmlFor="current_password"
              error={passwordErrors.current_password}
              required
            >
              <Input
                id="current_password"
                type="password"
                autoComplete="current-password"
                value={passwords.current_password}
                onChange={(event) =>
                  setPasswords((current) => ({ ...current, current_password: event.target.value }))
                }
                error={passwordErrors.current_password}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="New password"
                htmlFor="new_password"
                error={passwordErrors.new_password}
                required
              >
                <Input
                  id="new_password"
                  type="password"
                  autoComplete="new-password"
                  value={passwords.new_password}
                  onChange={(event) =>
                    setPasswords((current) => ({ ...current, new_password: event.target.value }))
                  }
                  error={passwordErrors.new_password}
                />
              </FormField>

              <FormField
                label="Confirm password"
                htmlFor="confirm_password"
                error={passwordErrors.confirm_password}
                required
              >
                <Input
                  id="confirm_password"
                  type="password"
                  autoComplete="new-password"
                  value={passwords.confirm_password}
                  onChange={(event) =>
                    setPasswords((current) => ({ ...current, confirm_password: event.target.value }))
                  }
                  error={passwordErrors.confirm_password}
                />
              </FormField>
            </div>

            <Button type="submit" variant="secondary" icon={Lock} loading={savingPassword}>
              Update password
            </Button>
          </form>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-ink">Application preferences</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            These defaults are stored on your user profile.
          </p>

          <form onSubmit={savePreferences} className="mt-5 space-y-4">
            <FormField
              label="Default statement period"
              htmlFor="default_statement_range"
              hint="Used to pre-fill the statement generator."
            >
              <Select
                id="default_statement_range"
                value={preferences.default_statement_range}
                onChange={(event) =>
                  setPreferences((current) => ({
                    ...current,
                    default_statement_range: event.target.value,
                  }))
                }
              >
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="current_month">This month</option>
              </Select>
            </FormField>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 px-3 py-3">
              <span>
                <span className="block text-sm font-medium text-ink">Show dashboard charts</span>
                <span className="block text-xs text-slate-500">
                  Monthly cash flow and credit/debit split.
                </span>
              </span>
              <input
                type="checkbox"
                checked={preferences.show_charts}
                onChange={(event) =>
                  setPreferences((current) => ({ ...current, show_charts: event.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300 text-royal focus:ring-royal/30"
              />
            </label>

            <Button type="submit" variant="secondary" icon={Save} loading={savingPreferences}>
              Save preferences
            </Button>
          </form>
        </section>

        <section className="card flex flex-col justify-between p-5 sm:p-6">
          <div>
            <div className="flex items-center gap-2">
              <User size={16} className="text-slate-400" />
              <h2 className="text-sm font-semibold text-ink">Session</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              You are signed in as <strong className="text-ink">{user?.username}</strong>. Signing
              out clears the server-side session cookie on this device.
            </p>
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
              This is an educational prototype. It never connects to a real bank and stores only
              dummy account data.
            </div>
          </div>

          <Button variant="danger-soft" icon={LogOut} onClick={handleLogout} className="mt-5 w-fit">
            Sign out of this device
          </Button>
        </section>
      </div>
    </div>
  );
}
