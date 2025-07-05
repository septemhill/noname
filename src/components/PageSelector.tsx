"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function PageSelector() {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Pages</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => router.push("/")}>
          Home
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/swap")}>
          Swap
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
