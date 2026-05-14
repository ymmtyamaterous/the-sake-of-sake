import { Link } from "@tanstack/react-router";
import { Menu, Wine, X } from "lucide-react";
import { useState } from "react";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="border-b bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-3">
        {/* ロゴ */}
        <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80">
          <Wine className="h-6 w-6" />
          <span className="font-serif text-lg font-bold tracking-tight">The sake of Sake</span>
        </Link>

        {/* ナビゲーション（デスクトップ） */}
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
          {/* ハンバーガーボタン（モバイル） */}
          <button
            type="button"
            className="flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground sm:hidden"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            aria-label={mobileNavOpen ? "メニューを閉じる" : "メニューを開く"}
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* モバイルナビゲーション */}
      {mobileNavOpen && (
        <nav className="border-t bg-card px-6 py-4 sm:hidden">
          <div className="flex flex-col gap-4">
            <Link
              to="/knowledge"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileNavOpen(false)}
            >
              知識を探す
            </Link>
            <Link
              to="/logs"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileNavOpen(false)}
            >
              マイ記録
            </Link>
            <Link
              to="/venues"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileNavOpen(false)}
            >
              お店記録
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

