"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateVideoSchema } from "@/db/schema";
import { trpc } from "@/trpc/client";
import {
  CheckIcon,
  CopyIcon,
  Globe2Icon,
  Loader2,
  LockIcon,
  MoreVerticalIcon,
  Trash2Icon,
} from "lucide-react";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import VideoPlayer from "@/modules/videos/ui/components/video-player";
import Link from "next/link";
import { useRouter } from "next/navigation";

const FormSection = ({ videoId }: { videoId: string }) => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  const update = trpc.videos.update.useMutation({
    onSuccess: () => {
      utils.studio.getOne.invalidate({ id: videoId });
      utils.studio.getMany.invalidate();
      toast.success("Video updated!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const deleteVideo = trpc.videos.delete.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      toast.success("Video deleted!");
      router.push("/studio");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const form = useForm<z.infer<typeof updateVideoSchema>>({
    resolver: zodResolver(updateVideoSchema),
    defaultValues: video,
  });

  const onSubmit = (data: z.infer<typeof updateVideoSchema>) => {
    update.mutate(data);
  };

  const [isCopied, setIsCopied] = useState(false);

  const fullUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/videos/${video.id}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
    toast.success("Link copied to clipboard");
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <header className="flex justify-between items-center mb-6 px-2">
              <section className="flex flex-col items-start gap-y-1">
                <h1 className="text-2xl font-semibold">Video Details</h1>
                <p className="text-muted-foreground text-sm">
                  Manage your video details here
                </p>
              </section>
              <section className="flex items-center gap-x-2">
                <Button
                  type="submit"
                  disabled={update.isPending}
                  className="cursor-pointer"
                >
                  {update.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="cursor-pointer">
                    <Button variant="ghost" size="icon">
                      <MoreVerticalIcon className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem
                      className="w-fit cursor-pointer"
                      onClick={() => deleteVideo.mutate({ id: videoId })}
                    >
                      {" "}
                      <Trash2Icon className="w-4 h-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </section>
            </header>
            <main className="grid grid-cols-1 lg:grid-cols-5 gap-8 px-2">
              <article className="lg:col-span-3 space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter video title" />
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
                          value={field.value || ""}
                          placeholder="Enter video description"
                          className=""
                          rows={8}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Category</FormLabel>
                      <FormControl className="w-full">
                        <Select
                          defaultValue={field.value ?? undefined}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent className="w-full">
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </article>
              <aside className="lg:col-span-2 flex flex-col gap-y-8">
                <section className="flex flex-col gap-4 bg-black/20 rounded-md overflow-hidden h-fit">
                  <figure className="aspect-video overflow-hidden relative">
                    <VideoPlayer
                      playbackId={video.muxPlaybackId}
                      thumbnailUrl={video.thumbnailUrl}
                    />
                  </figure>
                  <div className="flex flex-col gap-y-6 p-4">
                    <article className="flex items-center justify-between gap-x-2">
                      <fieldset className="flex flex-col gap-y-1">
                        <legend className="text-muted-foreground text-sm">
                          Video Link
                        </legend>
                        <div className="flex items-center gap-x-2">
                          <Link href={`/videos/${video.id}`} target="_blank">
                            <p className="text-sm text-blue-500 line-clamp-1">
                              {fullUrl}
                            </p>
                          </Link>
                          <Button
                            type="button"
                            variant={"ghost"}
                            size={"icon"}
                            className="shrink-0 cursor-pointer"
                            onClick={handleCopy}
                            disabled={isCopied}
                          >
                            {isCopied ? (
                              <CheckIcon className="w-4 h-4" />
                            ) : (
                              <CopyIcon className="w-4 h-4" />
                            )}
                            <span className="sr-only">Copy</span>
                          </Button>
                        </div>
                      </fieldset>
                    </article>
                    <article className="flex items-center justify-between">
                      <fieldset className="flex flex-col gap-y-2">
                        <legend className="text-muted-foreground text-sm">
                          Video Status
                        </legend>
                        <p className="text-sm capitalize">{video.muxStatus}</p>
                      </fieldset>
                    </article>
                    <article className="flex items-center justify-between">
                      <fieldset className="flex flex-col gap-y-2">
                        <legend className="text-muted-foreground text-sm">
                          Subtitle Status
                        </legend>
                        <p className="text-sm capitalize">
                          {video.muxTrackStatus || "Not Available"}
                        </p>
                      </fieldset>
                    </article>
                  </div>
                </section>
                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Visibility</FormLabel>
                      <FormControl className="w-full">
                        <Select
                          defaultValue={field.value ?? undefined}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full flex items-center">
                            <SelectValue placeholder="Select visibility" />
                          </SelectTrigger>
                          <SelectContent className="w-full">
                            <SelectItem value="public">
                              <Globe2Icon className="w-4 h-4" /> Public
                            </SelectItem>
                            <SelectItem value="private">
                              <LockIcon className="w-4 h-4" /> Private
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </aside>
            </main>
          </form>
        </Form>
      </ErrorBoundary>
    </Suspense>
  );
};

export default FormSection;
