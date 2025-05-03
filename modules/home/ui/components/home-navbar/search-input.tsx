"use client";

import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export const SearchInput = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const url = new URL(
      "/search",
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    );
    const newQuery = query.trim();

    url.searchParams.set("query", newQuery);

    if (newQuery === "") {
      url.searchParams.delete("query");
    }

    setQuery(newQuery);
    router.push(url.toString());
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center w-full max-w-[600px]"
    >
      <div className="relative flex flex-1 items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className={cn(
            "w-full px-4 h-11 text-base rounded-l-full border-[1px] border-secondary-foreground/10 bg-background focus:outline-none focus:border-blue-500",
            query && "pr-8"
          )}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-secondary-foreground/50 hover:text-secondary-foreground/80 cursor-pointer transition-colors focus:outline-none  rounded-full "
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={!query.trim()}
        className="px-6 h-11 bg-secondary/50 hover:bg-secondary/70 border-[1px] border-l-0 border-secondary-foreground/20 rounded-r-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Search className="w-5 h-5" />
      </button>
    </form>
  );
};
