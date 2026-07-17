"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LinkIcon, PencilIcon, Trash2Icon } from "lucide-react";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

interface PostMenuProps {
  phone: string | null;
  text: string;
  project: string;
  projects: string[];
  postId: number;
  handle: string;
  onDelete?: () => void;
  onEdit?: (newText: string, newProject: string) => void;
}

export default function ShareButton({
  phone,
  text,
  project,
  projects,
  postId,
  handle,
  onDelete,
  onEdit,
}: PostMenuProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState(text);
  const [editProject, setEditProject] = useState(project);
  const [saving, setSaving] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkOwner() {
      const { data } = await supabase.auth.getUser();
      if (data.user?.email) {
        setIsOwner(data.user.email.split("@")[0] === handle);
      }
    }
    checkOwner();
  }, [handle]);

  const waMessage = encodeURIComponent(
    `Hi! Regarding your scrum update:\n\n${text
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n")}`,
  );
  const waUrl = `https://wa.me/${phone}?text=${waMessage}`;

  const LIMIT = 1200;
  const overLimit = editText.length > LIMIT;

  async function handleEdit() {
    const unchanged = editText.trim() === text && editProject === project;
    if (!editText.trim() || unchanged || overLimit) { setEditOpen(false); return; }
    setSaving(true);
    await supabase.from("posts").update({ text: editText, project: editProject }).eq("id", postId);
    setSaving(false);
    setEditOpen(false);
    if (onEdit) onEdit(editText, editProject);
  }

  async function handleDelete() {
    await supabase.from("posts").delete().eq("id", postId);
    if (onDelete) onDelete();
    else router.push("/");
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger className="text-zinc-600 hover:text-zinc-300 transition-colors p-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {phone && (
            <DropdownMenuItem
              render={
                <a href={waUrl} target="_blank" rel="noopener noreferrer" />
              }
            >
              <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
              Chat
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() =>
              navigator.clipboard.writeText(
                `${window.location.origin}/post/${postId}`,
              )
            }
          >
            <LinkIcon className="w-4 h-4" />
            Copy link
          </DropdownMenuItem>
          {isOwner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setEditText(text); setEditProject(project); setEditOpen(true); }}>
                <PencilIcon className="w-4 h-4" />
                Edit post
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2Icon className="w-4 h-4" />
                Delete post
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit post</DialogTitle>
          </DialogHeader>
          <textarea
            className={`w-full min-h-[200px] rounded-lg bg-zinc-900 border text-sm text-zinc-200 p-3 resize-none focus:outline-none focus:ring-1 ${overLimit ? "border-red-500 focus:ring-red-500" : "border-zinc-700 focus:ring-zinc-500"}`}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-transparent px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors">
                {editProject || "Select project"}
                <svg className="w-3 h-3 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {projects.map((p) => (
                  <DropdownMenuItem key={p} onClick={() => setEditProject(p)}>
                    {p}
                    {p === editProject && <span className="ml-auto text-xs opacity-60">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <p className={`text-xs ${overLimit ? "text-red-400 font-medium" : "text-zinc-500"}`}>
              {editText.length}/1200{overLimit && " — too long"}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={saving || !editText.trim() || overLimit}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmDelete(false);
                handleDelete();
              }}
              className="bg-red-500 hover:bg-red-400 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
