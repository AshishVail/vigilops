"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SubscribeButton() {
  const [open,setOpen] = useState(false);
  const [email,setEmail] = useState("");
  return (
    <div className="flex flex-col items-end gap-2">
      {open&&<Input type="email" value={email} onChange={(event)=>setEmail(event.target.value)} placeholder="you@company.com" className="h-8 w-56"/>}
      <Button variant="outline" size="sm" onClick={()=>setOpen((value)=>!value)}>{open?"Subscribe":"Get updates"}</Button>
    </div>
  );
}
