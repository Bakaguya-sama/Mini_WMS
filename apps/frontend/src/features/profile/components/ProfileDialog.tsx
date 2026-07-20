import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useUpdateProfile } from "../hooks/useUpdateProfile";

// ─── Zod Schema — matches UpdateProfileInput constraints in api-docs.json ─────
const profileSchema = z
  .object({
    email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
    username: z
      .string()
      .min(3, "Username phải có ít nhất 3 ký tự")
      .max(50, "Username tối đa 50 ký tự")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
      .optional()
      .or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.password && data.password !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Mật khẩu xác nhận không khớp",
      path: ["confirmPassword"],
    },
  );

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog for updating own profile: email, username, password.
 * Per api-docs.json UpdateProfileInput — all fields optional.
 * Only sends non-empty fields to avoid accidentally overwriting unchanged data.
 */
export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user } = useAuthStore();
  const { mutate: updateProfile, isPending } = useUpdateProfile({
    onSuccess: () => onOpenChange(false),
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Pre-fill current user data when dialog opens
  useEffect(() => {
    if (open && user) {
      form.reset({
        email: user.email,
        username: user.username,
        password: "",
        confirmPassword: "",
      });
    }
  }, [open, user, form]);

  function onSubmit(values: ProfileFormValues) {
    // Only send fields that have changed and are non-empty
    const payload: Record<string, string> = {};

    if (values.email && values.email !== user?.email) {
      payload.email = values.email;
    }
    if (values.username && values.username !== user?.username) {
      payload.username = values.username;
    }
    if (values.password) {
      payload.password = values.password;
    }

    // Nothing changed
    if (Object.keys(payload).length === 0) {
      onOpenChange(false);
      return;
    }

    updateProfile(payload);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" id="profile-dialog">
        <DialogHeader>
          <DialogTitle>Cập nhật hồ sơ</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-2"
            id="profile-form"
          >
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      id="profile-email"
                      type="email"
                      placeholder="email@example.com"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đăng nhập</FormLabel>
                  <FormControl>
                    <Input
                      id="profile-username"
                      type="text"
                      placeholder="username"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input
                      id="profile-password"
                      type="password"
                      placeholder="Để trống nếu không đổi (Tối thiểu 6 ký tự)"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu</FormLabel>
                  <FormControl>
                    <Input
                      id="profile-confirm-password"
                      type="password"
                      placeholder="Nhập lại mật khẩu mới"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                id="profile-cancel"
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button id="profile-save" type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
