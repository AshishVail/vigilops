"use client";
import { LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const router = useRouter();
  const { supabase, user } = useSupabase();
  const name = typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : user?.email ?? "VigilOps User";
  async function logout(){await supabase.auth.signOut();router.replace("/login");router.refresh();}
  return <DropdownMenu><DropdownMenuTrigger><div className="ml-3 flex h-9 items-center gap-2 rounded-lg px-1.5 hover:bg-slate-100"><Avatar name={name} src={typeof user?.user_metadata?.avatar_url==="string"?user.user_metadata.avatar_url:undefined}/></div></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onClick={()=>router.push("/settings")}><User className="mr-2 h-4 w-4"/>Account</DropdownMenuItem><DropdownMenuItem onClick={()=>router.push("/settings")}><Settings className="mr-2 h-4 w-4"/>Settings</DropdownMenuItem><DropdownMenuItem onClick={logout}><LogOut className="mr-2 h-4 w-4"/>Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu>;
}
