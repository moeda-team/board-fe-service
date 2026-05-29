"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { useUpdateTenant } from "@/hooks/api/useUpdateTenant";

interface RenameTenantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  initialName: string;
}

interface RenameFormValues {
  name: string;
}

export function RenameTenantModal({
  open,
  onOpenChange,
  tenantId,
  initialName
}: RenameTenantModalProps) {
  const form = useForm<RenameFormValues>({
    defaultValues: {
      name: initialName
    }
  });

  const updateTenant = useUpdateTenant();

  useEffect(() => {
    if (open) {
      form.reset({ name: initialName });
    }
  }, [open, initialName, form]);

  const onSubmit = (values: RenameFormValues) => {
    if (!values.name.trim() || values.name.trim() === initialName) {
      onOpenChange(false);
      return;
    }
    updateTenant.mutate(
      { tenantId, name: values.name.trim() },
      {
        onSuccess: () => {
          onOpenChange(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-4" />
            Rename Organization
          </DialogTitle>
          <DialogDescription>
            Change the name of your current organization.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter organization name"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateTenant.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateTenant.isPending}>
                {updateTenant.isPending && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
