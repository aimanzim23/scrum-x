import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fromSlugDate, formatLongDate } from "../../../lib/scrumDate";
import ScrumReport from "./ScrumReport";

export async function generateMetadata(
  props: PageProps<"/scrums/[date]/[project]">,
): Promise<Metadata> {
  const { date, project } = await props.params;
  const iso = fromSlugDate(date);
  const name = decodeURIComponent(project);
  if (!iso) return { title: "Scrum report not found" };

  const label = formatLongDate(iso);
  return {
    title: `${name} · ${label}`,
    description: `Daily scrum report for ${name} on ${label}.`,
    openGraph: {
      title: `${name} scrum report`,
      description: label,
    },
  };
}

export default async function Page(props: PageProps<"/scrums/[date]/[project]">) {
  const { date, project } = await props.params;
  const iso = fromSlugDate(date);
  if (!iso) notFound();

  return <ScrumReport iso={iso} project={decodeURIComponent(project)} />;
}
