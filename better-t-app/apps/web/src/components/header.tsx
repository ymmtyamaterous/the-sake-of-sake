import { Link } from "@tanstack/react-router";
import { Wine } from "lucide-react";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  return (
    <header className="border-b bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-3">
        {/* ロゴ */}
        <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80">
          <Wine className="h-6 w-6" />
          <span className="font-serif text-lg font-bold tracking-tight">The sake of Sake</span>
        </Link>

        {/* ナビゲーション */}
        <nav className="hidden items-center gap-6 sm:flex">
          <Link
            to="/knowledge"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            知識を探す
          </Link>
          <Link
            to="/logs"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            マイ記録
          </Link>
          <Link
            to="/venues"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            お店記録
          </Link>
        </nav>

        {/* 右端 */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

