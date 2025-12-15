import { Form, useActionData, useNavigation } from "react-router";
import type { Route } from "../+types/root";
import { Input } from "~/components/ui/input";
import { Field, FieldLabel } from "~/components/ui/field";
import { useEffect, useMemo, useState } from "react";

type ActionData = { answer?: string } | undefined;

type ChatItem = {
  id: string;
  question: string;
  answer: string;
  createdAt: number;
};

const SUGGESTIONS = [
  "When is my crop ready to harvest?",
  "What moisture level should wheat have before harvest?",
  "How do I check maturity in tomatoes or peppers?",
  "What are the recommended indicators for determining sugarcane readiness?",
  "What simple field tests can I do to check harvest readiness?",
];

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const question = String(formData.get("question") || "");

  const res = await fetch("http://localhost:8000/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  return res.json();
}

export default function Assistant() {
  const data = useActionData() as ActionData;
  const nav = useNavigation();
  const isSubmitting = nav.state === "submitting";

  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<ChatItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // When action returns, append to history and select it
  useEffect(() => {
    if (!data?.answer) return;

    // only append if we have a question typed
    const q = question.trim();
    if (!q) return;

    const item: ChatItem = {
      id: crypto.randomUUID(),
      question: q,
      answer: data.answer,
      createdAt: Date.now(),
    };

    setHistory((prev) => [item, ...prev].slice(0, 20)); // max 20
    setSelectedId(item.id);
    setQuestion(""); // clear input after submit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.answer]);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return history.find((h) => h.id === selectedId) || null;
  }, [history, selectedId]);

  const filteredHistory = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return history;
    return history.filter((h) => h.question.toLowerCase().includes(s));
  }, [history, search]);

  const isNewChat = selectedId === null;

  function handleNewChat() {
    setSelectedId(null);
    setQuestion("");
  }

  async function handleCopy() {
    if (!selected?.answer) return;
    await navigator.clipboard.writeText(selected.answer);
    alert("Copied answer to clipboard.");
  }

  return (
    <div className="h-screen flex bg-white">
      {/* Sidebar */}
      <aside className="w-80 border-r bg-gray-50 p-4 flex flex-col gap-3">
        <button
          onClick={handleNewChat}
          className="w-full rounded-md bg-black text-white py-2 text-sm hover:opacity-90"
          type="button"
        >
          + New chat
        </button>

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search chats…"
        />

        <div className="text-xs text-gray-500 mt-1">Recent</div>

        <div className="flex-1 overflow-auto space-y-2">
          {filteredHistory.length === 0 ? (
            <div className="text-sm text-gray-500 mt-3">
              No previous chats yet.
            </div>
          ) : (
            filteredHistory.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={[
                  "w-full text-left rounded-md border px-3 py-2 text-sm",
                  item.id === selectedId ? "bg-white border-black" : "bg-white/60 hover:bg-white",
                ].join(" ")}
              >
                <div className="font-medium truncate">{item.question}</div>
                <div className="text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="text-xs text-gray-400">
          (DB history will plug in later via /history)
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b px-6 flex items-center justify-between">
          <div className="font-semibold">🤖Harvest Readiness Assistant</div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
              onClick={handleCopy}
              disabled={!selected?.answer}
              title="Copy / Share"
            >
              Share
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 py-6">
          <div className="max-w-3xl mx-auto">
            {isNewChat ? (
              <div className="rounded-xl border bg-gray-50 p-6">
                <h1 className="text-xl font-semibold mb-2">
                  What can I help with?
                </h1>
                <p className="text-sm text-gray-600 mb-4">
                  Ask a harvest-readiness question. Try one of these:
                </p>

                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setQuestion(s)}
                      className="rounded-full border bg-white px-3 py-1 text-sm hover:bg-gray-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              selected && (
                <div className="space-y-4">
                  {/* User bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl bg-black text-white px-4 py-3 text-sm">
                      {selected.question}
                    </div>
                  </div>

                  {/* AI bubble */}
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl border bg-white px-4 py-3">
                      <div className="text-xs text-gray-500 mb-2">AI</div>
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-6">
                        {selected.answer}
                      </pre>
                    </div>
                  </div>
                </div>
              )
            )}

            {isSubmitting && (
              <div className="mt-6 text-sm text-gray-600">
                Thinking…
              </div>
            )}
          </div>
        </div>

        {/* Composer (sticky input) */}
        <div className="border-t px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <Form method="post" className="flex gap-2 items-end">
              <Field className="flex-1">
                <FieldLabel htmlFor="question" className="sr-only">
                  User
                </FieldLabel>
                <Input
                  id="question"
                  name="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a harvest-readiness question…"
                  required
                />
              </Field>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 disabled:opacity-60"
              >
                {isSubmitting ? "..." : "Send"}
              </button>
            </Form>

            <div className="text-xs text-gray-500 mt-2">
              Tip: include crop + what you want to check (moisture, maturity, readiness).
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

















































































































































































































































// import { Form, useActionData, useNavigation } from "react-router";
// import type { Route } from "../+types/root";
// import { Input } from "~/components/ui/input";
// import { Field, FieldLabel } from "~/components/ui/field";

// export async function clientAction({ request }: Route.ClientActionArgs) {
//   const formData = await request.formData();
//   const question = String(formData.get("question") || "");

//   const res = await fetch("http://localhost:8000/ask", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ question }),
//   });

//   return res.json(); 
// }

// export default function QuesAns() {
//   const data = useActionData() as { answer?: string } | undefined;
//   const nav = useNavigation();
//   const isSubmitting = nav.state === "submitting";

//   return (
//     <div className="max-w-xl mx-auto p-6">
//       <h1 className="text-xl font-semibold mb-4">Harvest Readiness Q&A</h1>

//       <Form method="post" className="space-y-4">
//         <Field>
//           <FieldLabel htmlFor="question">User</FieldLabel>
//           <Input
//             id="question"
//             name="question"
//             type="text"
//             placeholder="Ask a harvest-readiness question..."
//             required
//           />
//         </Field>

//         <button
//           type="submit"
//           disabled={isSubmitting}
//           className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 disabled:opacity-60"
//         >
//           {isSubmitting ? "Submitting..." : "Submit"}
//         </button>
//       </Form>

//       <div className="mt-6">
//         <h2 className="font-medium mb-2">AI</h2>
//         <pre className="whitespace-pre-wrap">{data?.answer || ""}</pre>
//       </div>
//     </div>
//   );
// }
