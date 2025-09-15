"use client";

import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { MediaModal } from "@/components/media/media-modal";
import { MediaTrigger } from "@/components/media/media-modal";
import { useMediaModal } from "@/context/media-modal-provider";

export function MediaTopbarActions() {
  const { toggle } = useMediaModal();
  return (
    <div className="ms-auto flex items-center space-x-2 sm:space-x-3 flex-nowrap">
      <MediaTrigger onOpen={toggle} />
      <Search />
      <ThemeSwitch />
      <ProfileDropdown />
    </div>
  );
}

export function MediaModalMount() {
  const { open, setOpen } = useMediaModal();
  return <MediaModal open={open} onOpenChange={setOpen} />;
}

