"use client";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
"use client";

import React from "react";

type HeaderProps = {
  fixed?: boolean;
  className?: string;
  children?: React.ReactNode;
};

function Header({ fixed, className, children }: HeaderProps) {
  return (
    <header
      className={[
        "w-full border-b bg-background/80 backdrop-blur",
        fixed ? "sticky top-0 z-50" : "",
        className || "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-2 px-3 sm:h-16 sm:px-4">
        {children}
      </div>
    </header>
  );
}

export { Header };
export default Header;
