'use client';

import { LogOutIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { signOut, useSession } from '@/lib/auth-client';
import { initials } from '@/lib/format';

export function UserMenu() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return <Skeleton className="h-8 w-24 rounded-lg" />;
  }

  if (!session) {
    return (
      <>
        <Button variant="ghost" size="sm" render={<Link href="/login" />}>
          Sign in
        </Button>
        <Button size="sm" render={<Link href="/signup" />}>
          Sign up
        </Button>
      </>
    );
  }

  const label = session.user.name || session.user.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" aria-label="Account menu">
            <span className="grid size-5 place-items-center rounded-full bg-secondary font-mono text-[10px] font-medium text-secondary-foreground">
              {initials(label)}
            </span>
            <span className="max-w-32 truncate">{label}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled>
          <UserIcon />
          {session.user.email}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            router.push('/');
            router.refresh();
          }}
        >
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
