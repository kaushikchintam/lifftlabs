// landing page
"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import RolePicker from "@/components/marketing/role-picker";


export default function HomePage() {
    const [open, setOpen] = useState(false)
    return (
        <section className="font-archivo-black flex flex-col items-center justify-center text-center px-6 py-32 bg-[#DDEBF3] min-h-[calc(100vh-73px)]">
            <span className="inline-block border border-[#2596BE] text-[#2596BE] text-sm px-4 py-1 rounded-full mb-8">
                Powering tomorrow's healthcare workforce
            </span>
            <h1 className="font-archivo-black text-4xl md:text-5xl text-[#18150F] max-w-2xl leading-tight mb-6" >
                The way into, through, and within healthcare.
            </h1>
            <p className="font-dm-sans text-[#3A372F] text-lg max-w-xl leading-relaxed mb-10">
                LIFFT is the platform for retraining into medicine and advance within it, personalized pathways, expert mentorship and structured learning.
            </p>
            <RolePicker open={open} onClose={() => setOpen(false)}></RolePicker>
            <Button className="h-auto bg-[#2596BE] hover:bg-[#1A7A9E] text-white rounded-full px-8 py-3 text-base" onClick={() => setOpen(true)}>
                I'm a professional
            </Button>
        </section>
    );
}