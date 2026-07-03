import type { Schema } from "./structured-data";

export function JsonLd({ schema }: { schema: Schema | Schema[] }) {
  const json = JSON.stringify(schema);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
