import { redirect } from "next/navigation";

// ponytail: stub until this route is deleted — old links land on signup.
export default async function MatchPage(props: PageProps<"/journey/[slug]/match">) {
  const { slug } = await props.params;
  const q = new URLSearchParams(
    Object.entries(await props.searchParams).filter((e): e is [string, string] => typeof e[1] === "string")
  );
  redirect(`/journey/${slug}/account?${q}`);
}
