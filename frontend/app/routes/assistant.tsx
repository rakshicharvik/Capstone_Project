import { Form, useActionData, useNavigation } from "react-router";
import type { Route } from "../+types/root";
import { Input } from "~/components/ui/input";
import { Field, FieldLabel } from "~/components/ui/field";

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

export default function QuesAns() {
  const data = useActionData() as { answer?: string } | undefined;
  const nav = useNavigation();
  const isSubmitting = nav.state === "submitting";

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Harvest Readiness Q&A</h1>

      <Form method="post" className="space-y-4">
        <Field>
          <FieldLabel htmlFor="question">User</FieldLabel>
          <Input
            id="question"
            name="question"
            type="text"
            placeholder="Ask a harvest-readiness question..."
            required
          />
        </Field>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </Form>

      <div className="mt-6">
        <h2 className="font-medium mb-2">AI</h2>
        <pre className="whitespace-pre-wrap">{data?.answer || ""}</pre>
      </div>
    </div>
  );
}
