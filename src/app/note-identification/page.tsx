import type { Metadata } from "next";

import { NoteIdentification } from "@/features/note-identification/NoteIdentification";

export const metadata: Metadata = {
  title: "Yuei · Note Identification",
  description:
    "Practice identifying written notes on treble and bass clefs.",
};

export default function NoteIdentificationPage() {
  return <NoteIdentification />;
}
