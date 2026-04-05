import { useEffect, useState } from "react";
import { X, FileText } from "lucide-react";
import { type Socket } from "socket.io-client";

export function IdeMeetNotes({
  open,
  onClose,
  socket,
  chrome,
}: {
  open: boolean;
  onClose: () => void;
  socket: Socket | null;
  chrome: any;
}) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!socket) return;
    const onSessionState = (data: any) => {
      if (typeof data.notes === "string") {
        setNotes(data.notes);
      }
    };
    const onNoteUpdate = (data: { notes: string; userId: string }) => {
      setNotes(data.notes);
    };

    socket.on("session-state", onSessionState);
    socket.on("note-update", onNoteUpdate);
    return () => {
      socket.off("session-state", onSessionState);
      socket.off("note-update", onNoteUpdate);
    };
  }, [socket]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    socket?.emit("note-update", { notes: val });
  };

  if (!open) return null;

  return (
    <div
      className="absolute top-14 right-4 z-[50] flex w-[320px] flex-col rounded-xl border shadow-2xl transition-transform"
      style={{
        backgroundColor: chrome.sidebar,
        borderColor: chrome.border,
        height: "400px",
      }}
    >
      <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: chrome.border }}>
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[#e0e0e0]">
          <FileText className="h-4 w-4" />
          Meet Notes
        </h3>
        <button type="button" onClick={onClose} className="rounded p-1 text-[#888] hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 p-2">
        <textarea
          value={notes}
          onChange={handleChange}
          placeholder="Collaborative meeting notes..."
          className="h-full w-full resize-none rounded border bg-[#1e1e1e] p-2 text-[12px] text-[#e0e0e0] outline-none placeholder:text-[#666] focus:border-violet-500/60"
          style={{ borderColor: chrome.border }}
        />
      </div>
    </div>
  );
}
