import { redirect } from "next/navigation";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// /account → /account/settings, forwarding any query params (e.g. ?purchase=success)
export default async function AccountIndexPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const qs = new URLSearchParams(
    Object.entries(params).flatMap(([k, v]) =>
      v === undefined ? [] : Array.isArray(v) ? v.map((val) => [k, val]) : [[k, v]],
    ),
  ).toString();
  redirect(`/account/settings${qs ? `?${qs}` : ""}`);
}
