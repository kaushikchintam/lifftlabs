"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RolePickerProps {
    open: boolean
    onClose: () => void
}

export default function RolePicker({ open, onClose }: RolePickerProps) {
    const router = useRouter()
    
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-xl p-6 bg-white rounded-2xl">

                {/* Log in pill */}
                <Link
                    href="/login"
                    className="font-dm-sans inline-flex items-center text-xs text-[#18150F] border border-border rounded-full px-3 py-1 hover:border-[#2596BE] hover:text-[#2596BE] transition-colors w-fit mb-4"
                >
                    Log in to LIFFT
                </Link>

                <DialogTitle className="font-archivo-black text-2xl text-[#18150F] mb-1">
                    Welcome back.
                </DialogTitle>
                <p className="font-dm-sans text-sm text-[#2596BE] mb-4">Which side are you on?</p>

                <div className="flex gap-4">
                    {/* Learner Card */}
                    <div
                        onClick={() => router.push("/signup/learner")}
                        className="flex-1 cursor-pointer rounded-xl border border-border overflow-hidden hover:border-[#2596BE] transition-colors"
                    >
                        <div className="bg-[#F2F4F6] h-20 flex items-center justify-center">
                            <img src="/illustrations/learner.svg" alt="Learner" className="h-16 object-contain" />
                        </div>
                        <div className="p-4">
                            <h3 className="font-archivo-black text-[#18150F] text-lg">I'm a learner</h3>
                            <p className="font-dm-sans text-[#6F6B60] text-sm mb-3">Finding my next move</p>
                            <span className="font-dm-sans text-[#2596BE] text-sm font-medium">Continue as learner →</span>
                        </div>
                    </div>

                    {/* Mentor Card */}
                    <div
                        onClick={() => router.push("/signup/mentor")}
                        className="flex-1 cursor-pointer rounded-xl border border-border overflow-hidden hover:border-[#2596BE] transition-colors"
                    >
                        <div className="bg-[#F2F4F6] h-20 flex items-center justify-center">
                            <img src="/illustrations/mentor.svg" alt="Mentor" className="h-16 object-contain" />
                        </div>
                        <div className="p-4">
                            <h3 className="font-archivo-black text-[#18150F] text-lg">I'm a mentor</h3>
                            <p className="font-dm-sans text-[#6F6B60] text-sm mb-3">Guiding someone through theirs</p>
                            <span className="font-dm-sans text-[#2596BE] text-sm font-medium">Continue as mentor →</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}