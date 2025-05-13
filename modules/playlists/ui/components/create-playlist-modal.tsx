"use client";

import { z } from "zod";
import { trpc } from "@/trpc/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { ResponsiveModal } from "@/components/responsive-modal";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CreatePlaylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const CreatePlaylistModal = ({
  open,
  onOpenChange,
}: CreatePlaylistModalProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const create = trpc.playlists.createPlaylist.useMutation({
    onSuccess: () => {
      form.reset();
      toast.success("playlist created!");
      onOpenChange(false);
    },
    onError: (e) => {
      if (e.data?.code === "BAD_REQUEST") {
        onOpenChange(false);
        toast.success(e.message);
      }
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    create.mutate(values);
  };

  return (
    <>
      <ResponsiveModal
        title="Create Playlist"
        open={open || create.isPending}
        onOpenChange={onOpenChange}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="My Playlist"
                      className="rounded-sm outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 ring-0"
                      disabled={create.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={2}
                      required={false}
                      draggable={false}
                      disabled={create.isPending}
                      placeholder="Describe your playlist (optional)"
                      className="rounded-sm outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 ring-0 resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="default"
              className="flex justify-end ml-auto rounded-sm font-medium px-4 cursor-pointer"
              disabled={create.isPending}
            >
              {create.isPending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <span>Create</span>
              )}
            </Button>
          </form>
        </Form>
      </ResponsiveModal>
    </>
  );
};

export default CreatePlaylistModal;
