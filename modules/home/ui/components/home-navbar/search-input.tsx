"use client";

import { Search } from "lucide-react";
import { FormEvent, useState } from "react";

export const SearchInput = () => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center w-full max-w-[600px]"
    >
      <div className="flex flex-1 items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="w-full px-4 h-11 text-base rounded-l-full border border-r-0 border-secondary-foreground/20 bg-background focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="px-6 h-11 bg-secondary/50 hover:bg-secondary/70 border border-l-0 border-secondary-foreground/20 rounded-r-full transition-colors cursor-pointer"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};
