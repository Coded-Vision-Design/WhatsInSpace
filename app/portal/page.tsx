import type { Metadata } from "next";
import PortalClient from "./PortalClient";

export const metadata: Metadata = {
  title: "Sky Portal | What's That In Space?",
  description:
    "Point a Chartemus board at the sky and watch the stars, planets, the Moon and the ISS line up in real time - an interactive window into space.",
};

export default function PortalPage() {
  return <PortalClient />;
}
