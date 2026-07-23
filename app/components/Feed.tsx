"use client";

import { type Post } from "../lib/posts";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import DatePicker from "./DatePicker";
import ShareButton from "./ShareButton";
import { randomPlaceholder } from "../lib/composePlaceholders";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { CalendarIcon, CheckIcon, ChevronDownIcon, LogOutIcon, PlusIcon, Share2Icon } from "lucide-react";
import { getProjectColor } from "../lib/projectColor";
import { toSlugDate } from "../lib/scrumDate";

const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateStr(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function buildWeekdayStrip(count = 10): Date[] {
  const result: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (result.length < count) {
    if (d.getDay() !== 0 && d.getDay() !== 6) result.unshift(new Date(d));
    d.setDate(d.getDate() - 1);
  }
  return result;
}

function lastWeekday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1);
  return d;
}

export default function Feed() {
  const today = new Date();
  const todayStr = toDateStr(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = toDateStr(yesterday);

  const dateStrip = buildWeekdayStrip(10);
  const mostRecentStr = toDateStr(lastWeekday());

  const [projects, setProjects] = useState<string[]>([]);
  const [activeProject, setActiveProject] = useState("All");
  const [newPost, setNewPost] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(mostRecentStr);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [addingProject, setAddingProject] = useState(false);
  const [composeExpanded, setComposeExpanded] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, Post>>({});
  const [savingDraft, setSavingDraft] = useState(false);
  const [showDeleteDraftDialog, setShowDeleteDraftDialog] = useState(false);
  const dateStripRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const [user, setUser] = useState<{
    email?: string;
    user_metadata?: { phone?: string };
  } | null>(null);

  useEffect(() => {
    if (dateStripRef.current) {
      dateStripRef.current.scrollLeft = dateStripRef.current.scrollWidth;
    }
    setPlaceholder(randomPlaceholder());
  }, []);

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.push("/login");
      else setUser(data.user);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    async function fetchProjects() {
      const { data } = await supabase
        .from("projects")
        .select("name")
        .order("created_at", { ascending: true });
      if (data) {
        const names = data.map((p) => p.name);
        setProjects(names);
        if (names.length > 0) setSelectedProject(names[0]);
      }
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    async function fetchPosts() {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("is_draft", false)
        .order("created_at", { ascending: false });
      if (data) setPosts(data);
      setLoading(false);
    }
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    async function fetchDrafts() {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("author", user!.email!)
        .eq("is_draft", true);
      if (data) {
        const map: Record<string, Post> = {};
        data.forEach((d) => { map[d.project] = d; });
        setDrafts(map);
      }
    }
    fetchDrafts();
  }, [user]);

  useEffect(() => {
    if (!composeExpanded) return;
    const draft = drafts[selectedProject];
    setNewPost(draft?.text ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composeExpanded]);

  async function handleAddProject() {
    const name = newProjectName.trim();
    if (!name) return;
    setAddingProject(true);
    const { error } = await supabase.from("projects").insert({ name });
    if (!error) {
      const updated = [...projects, name];
      setProjects(updated);
      setSelectedProject(name);
    }
    setNewProjectName("");
    setShowAddProject(false);
    setAddingProject(false);
  }

  async function handleSaveDraft() {
    if (!newPost.trim() || !selectedProject || !user?.email) return;
    setSavingDraft(true);
    const existing = drafts[selectedProject];
    const payload = {
      text: newPost,
      project: selectedProject,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
    let saved: Post | null = null;
    if (existing) {
      const { data } = await supabase.from("posts").update(payload).eq("id", existing.id).select().single();
      saved = data;
    } else {
      const { data } = await supabase.from("posts").insert({
        ...payload,
        author: user.email,
        handle: user.email.split("@")[0],
        phone: user.user_metadata?.phone ?? null,
        is_draft: true,
      }).select().single();
      saved = data;
    }
    if (saved) setDrafts({ ...drafts, [selectedProject]: saved });
    setSavingDraft(false);
    setNewPost("");
    setComposeExpanded(false);
  }

  async function handleDeleteDraft() {
    const draft = drafts[selectedProject];
    if (!draft) return;
    await supabase.from("posts").delete().eq("id", draft.id);
    const newDrafts = { ...drafts };
    delete newDrafts[selectedProject];
    setDrafts(newDrafts);
    setNewPost("");
    setComposeExpanded(false);
    setShowDeleteDraftDialog(false);
  }

  async function handleShare() {
    const url = `${window.location.origin}/scrums/${toSlugDate(selectedDate)}/${encodeURIComponent(activeProject)}`;
    await navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  }

  const filteredPosts = posts
    .filter((post) => activeProject === "All" || post.project === activeProject)
    .filter((post) => {
      if (!selectedDate) return true;
      const postDate = new Date(post.created_at).toDateString();
      return postDate === new Date(selectedDate + "T00:00:00").toDateString();
    });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-black/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <img src="/scrumx-wordmark-light.svg" alt="ScrumX" className="h-7" />
          <div className="flex items-center gap-1">
            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  showCalendar
                    ? "bg-sky-500/20 text-sky-400"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <CalendarIcon className="w-5 h-5" />
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end" className="w-auto p-0 border-zinc-800">
                <DatePicker
                  value={selectedDate}
                  onChange={(date) => {
                    if (date) setSelectedDate(date);
                    setShowCalendar(false);
                  }}
                />
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold hover:bg-zinc-600 transition-colors">
                {user?.email?.[0].toUpperCase() ?? "?"}
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end">
                <DropdownMenuItem
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push("/login");
                  }}
                >
                  <LogOutIcon className="w-4 h-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* Date Strip */}
        <div className="sticky top-14 z-20 bg-black/90 backdrop-blur-md border-b border-zinc-800">
          <div ref={dateStripRef} className="flex overflow-x-auto scrollbar-hide">
            {dateStrip.map((d) => {
              const str = toDateStr(d);
              const isSelected = str === selectedDate;
              const isToday = str === todayStr;
              const isYesterday = str === yesterdayStr;
              const label = isToday
                ? "Today"
                : isYesterday
                ? "Yesterday"
                : `${DAY_ABBR[d.getDay()]} ${d.getDate()} ${d.toLocaleString("en-GB", { month: "short" })}`;
              return (
                <button
                  key={str}
                  onClick={() => setSelectedDate(str)}
                  className={`relative shrink-0 px-4 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                    isSelected
                      ? "text-white"
                      : isToday
                      ? "text-sky-400 hover:text-sky-300"
                      : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {label}
                  {isSelected && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Project Chips */}
        <div className="border-b border-zinc-800 px-4 py-3 flex items-center gap-2 flex-wrap">
          {["All", ...projects].map((p) => (
            <button
              key={p}
              onClick={() => setActiveProject(p)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activeProject === p
                  ? "border-sky-500 bg-sky-500/10 text-sky-400"
                  : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setShowAddProject(true)}
            className="w-6 h-6 rounded-full border border-zinc-700 text-zinc-500 hover:border-zinc-400 hover:text-zinc-300 flex items-center justify-center transition-colors"
          >
            <PlusIcon className="w-3.5 h-3.5" />
          </button>
          {activeProject !== "All" && (
            <button
              onClick={handleShare}
              title={`Copy a public link to the ${activeProject} report for this day`}
              className={`ml-auto inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                shareCopied
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                  : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
              }`}
            >
              {shareCopied ? (
                <CheckIcon className="w-3.5 h-3.5" />
              ) : (
                <Share2Icon className="w-3.5 h-3.5" />
              )}
              {shareCopied ? "Link copied" : "Share"}
            </button>
          )}
        </div>

        {/* Compose Box */}
        {!composeExpanded ? (
          <div
            className="border-b border-zinc-800 px-4 py-3 flex items-center gap-3 cursor-text"
            onClick={() => setComposeExpanded(true)}
          >
            <Avatar size="lg">
              <AvatarFallback className="bg-zinc-700 text-white font-bold text-sm">
                {user?.email?.[0].toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-zinc-600 text-sm flex-1">
              {drafts[selectedProject] ? (
                <span className="text-zinc-400">Draft saved — tap to continue editing</span>
              ) : placeholder}
            </span>
            {drafts[selectedProject] && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowDeleteDraftDialog(true); }}
                className="text-zinc-500 text-xs hover:text-red-400 transition-colors"
              >
                Delete draft
              </button>
            )}
            <span className="bg-sky-500/20 text-sky-400 text-xs font-bold rounded-full px-3 py-1.5">
              Post
            </span>
          </div>
        ) : (
          <div className="border-b border-zinc-800 px-4 pt-3 pb-3">
            <div className="flex justify-end mb-2">
              {newPost.trim() && (
                <button
                  disabled={savingDraft}
                  onClick={handleSaveDraft}
                  className="text-sky-400 text-sm font-medium hover:text-sky-300 transition-colors disabled:opacity-50"
                >
                  {savingDraft ? "Saving…" : "Save draft"}
                </button>
              )}
            </div>
            {/* Compose body */}
            <div className="flex gap-3">
              <Avatar size="lg">
                <AvatarFallback className="bg-zinc-700 text-white font-bold">
                  {user?.email?.[0].toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  autoFocus
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder={placeholder}
                  maxLength={1200}
                  className="border-none focus-visible:ring-0 bg-transparent dark:bg-transparent text-white placeholder:text-zinc-600 min-h-[80px] resize-none"
                />

                {/* Bottom toolbar */}
                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60">
                  {/* Left: project dropdown + char count */}
                  <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 text-sky-400 text-sm font-medium rounded-full px-4 py-1.5 hover:border-zinc-500 transition-colors">
                      {selectedProject || "Project"}
                      <ChevronDownIcon className="w-3.5 h-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="start">
                      {projects.map((p) => (
                        <DropdownMenuItem
                          key={p}
                          onClick={() => setSelectedProject(p)}
                          className={selectedProject === p ? "text-sky-400" : ""}
                        >
                          <span
                            className={`inline-block w-2 h-2 rounded-full mr-1 ${getProjectColor(p, projects).split(" ")[0].replace("/10", "").replace("bg-", "bg-")}`}
                          />
                          {p}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <span className={`text-xs tabular-nums ${1200 - newPost.length < 20 ? "text-red-400" : "text-zinc-500"}`}>
                    {1200 - newPost.length}
                  </span>
                  </div>

                  {/* Right: cancel + Post */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setComposeExpanded(false); setNewPost(""); }}
                      className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <Button
                      disabled={!newPost.trim() || !selectedProject}
                      onClick={async () => {
                        if (!newPost.trim() || !selectedProject || !user?.email) return;
                        const existing = drafts[selectedProject];
                        const now = new Date();
                        const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                        let posted: Post | null = null;
                        if (existing) {
                          const { data } = await supabase
                            .from("posts")
                            .update({ text: newPost, project: selectedProject, is_draft: false, time, created_at: now.toISOString() })
                            .eq("id", existing.id)
                            .select()
                            .single();
                          posted = data;
                          if (posted) {
                            const newDrafts = { ...drafts };
                            delete newDrafts[selectedProject];
                            setDrafts(newDrafts);
                          }
                        } else {
                          const { data } = await supabase
                            .from("posts")
                            .insert({
                              author: user.email,
                              handle: user.email.split("@")[0],
                              phone: user.user_metadata?.phone ?? null,
                              project: selectedProject,
                              time,
                              text: newPost,
                              is_draft: false,
                            })
                            .select()
                            .single();
                          posted = data;
                        }
                        if (posted) setPosts([posted, ...posts]);
                        setNewPost("");
                        setComposeExpanded(false);
                      }}
                      className="bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-full px-5"
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feed */}
        <main>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 py-4 border-b border-zinc-800">
                <div className="flex gap-3">
                  <Skeleton className="size-10 rounded-full shrink-0 bg-zinc-800" />
                  <div className="flex-1 space-y-2.5 pt-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-28 bg-zinc-800" />
                      <Skeleton className="h-3 w-16 bg-zinc-800" />
                      <Skeleton className="ml-auto h-5 w-14 rounded-full bg-zinc-800" />
                    </div>
                    <Skeleton className="h-3 w-full bg-zinc-800" />
                    <Skeleton className="h-3 w-4/5 bg-zinc-800" />
                    <Skeleton className="h-3 w-2/3 bg-zinc-800" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredPosts.length === 0 ? (
            <p className="py-16 text-center text-zinc-600 text-sm">No reports yet.</p>
          ) : (
            filteredPosts.map((post) => (
              <article
                key={post.id}
                onClick={() => router.push(`/post/${post.id}`)}
                className="px-4 py-4 border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors cursor-pointer"
              >
                <div className="flex gap-3">
                  <Avatar size="lg">
                    <AvatarFallback className="bg-zinc-700 text-white font-bold">
                      {post.author.split(" ").map((n: string) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm truncate max-w-[140px]">
                        {post.handle.charAt(0).toUpperCase() + post.handle.slice(1)}
                      </span>
                      <span className="text-zinc-500 text-sm truncate max-w-[100px]">@{post.handle}</span>
                      <span className="text-zinc-600 text-sm">·</span>
                      <span className="text-zinc-500 text-sm">
                        {(() => {
                          const diffDays = Math.floor(
                            (Date.now() - new Date(post.created_at).getTime()) / 86400000,
                          );
                          if (diffDays === 0) return post.time;
                          if (diffDays <= 7) return `${diffDays}d`;
                          return new Date(post.created_at).toLocaleDateString("en-GB");
                        })()}
                      </span>
                      <Badge
                        variant="outline"
                        className={`ml-auto ${getProjectColor(post.project, projects)}`}
                      >
                        {post.project}
                      </Badge>
                      <ShareButton
                        phone={post.phone}
                        text={post.text}
                        project={post.project}
                        projects={projects}
                        postId={post.id}
                        handle={post.handle}
                        onDelete={() => setPosts(posts.filter((p) => p.id !== post.id))}
                        onEdit={(newText, newProject) => setPosts(posts.map((p) => p.id === post.id ? { ...p, text: newText, project: newProject } : p))}
                      />
                    </div>
                    <p className="mt-2 text-sm text-zinc-300 whitespace-pre-wrap break-words">{post.text}</p>
                  </div>
                </div>
              </article>
            ))
          )}
        </main>
      </div>

      {/* Delete Draft Dialog */}
      <AlertDialog open={showDeleteDraftDialog} onOpenChange={setShowDeleteDraftDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your saved draft. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDraft}
              className="bg-red-500 hover:bg-red-400 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Project Dialog */}
      <Dialog open={showAddProject} onOpenChange={setShowAddProject}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddProject()}
            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:border-sky-500 h-10"
            autoFocus
          />
          <DialogFooter className="border-0 bg-transparent p-0 -mx-0 -mb-0 mt-1">
            <Button
              variant="outline"
              onClick={() => { setShowAddProject(false); setNewProjectName(""); }}
              className="border-zinc-700 text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddProject}
              disabled={!newProjectName.trim() || addingProject}
              className="bg-sky-500 hover:bg-sky-400 text-white"
            >
              {addingProject ? "Adding..." : "Add project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
