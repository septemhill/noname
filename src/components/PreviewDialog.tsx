"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  previewInfo: { [key: string]: string | number };
  onConfirm: () => void;
  confirmButtonText?: string;
  title?: string;
  description?: string;
}

export function PreviewDialog({
  isOpen,
  onOpenChange,
  previewInfo,
  onConfirm,
  confirmButtonText = "Confirm",
  title = "Details",
  description = "Please review the details before confirming.",
}: PreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {Object.entries(previewInfo).map(([key, value]) => (
            <div className="grid gap-1" key={key}>
              <p className="text-sm font-medium text-muted-foreground">{key}</p>
              <p className="text-base font-semibold">{value}</p>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onConfirm}>{confirmButtonText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
