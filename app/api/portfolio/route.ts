import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";
import { PORTFOLIO_CATEGORIES, PORTFOLIO_TYPES, type PortfolioCategory } from "@/features/portfolio/components/data/portfolio-options";

interface AttachmentRow {
    id: string;
    portfolio_entry_id: string;
    file_name: string;
    kind: string;
    storage_path: string;
}

interface CreatePortfolioBody {
    category: PortfolioCategory;
    title: string;
    type: string;
    organisation: string;
    linked_specialty?: string;
    start_date: string;
    end_date?: string;
    reflection: string;
}

const VALID_CATEGORIES = PORTFOLIO_CATEGORIES.map((c) => c.value);

export async function GET(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const userId = guard.session.user.id;

    const { data: entries, error: entriesError } = await supabaseAdmin
       .from("portfolio_entries")
       .select("id, category, title, type, organisation, linked_specialty, start_date, end_date, reflection, signed_off_at, signed_off_by, created_at")
       .eq("user_id", userId)
       .order("created_at", { ascending: true });

    if (entriesError) {
        return NextResponse.json({ error: entriesError.message }, { status: 500 });
    }

    const { data: attachments, error: attachmentsError } = await supabaseAdmin
      .from("portfolio_attachments")
      .select("id, portfolio_entry_id, file_name, kind, storage_path")
      .eq("user_id", userId);

    if (attachmentsError) {
        return NextResponse.json({ error: attachmentsError.message }, { status: 500 });
    }

    const safeAttachments = attachments || [];

    const attachmentsWithUrls = await Promise.all(
        safeAttachments.map(async (file: AttachmentRow) => {
            const { data, error: storageError } = await supabaseAdmin.storage
               .from("portfolio-attachments")
               .createSignedUrl(file.storage_path, 60 * 15);

            if (storageError) {
                console.error(`Storage error for ${file.storage_path}:`, storageError.message);
            }
            return {
                id: file.id,
                portfolio_entry_id: file.portfolio_entry_id,
                file_name: file.file_name,
                kind: file.kind,
                signedUrl: data?.signedUrl || "",
            };
        })
    );

    const attachmentsByEntry = new Map<string, typeof attachmentsWithUrls>();
    for (const file of attachmentsWithUrls) {
        const group = attachmentsByEntry.get(file.portfolio_entry_id) ?? [];
        group.push(file);
        attachmentsByEntry.set(file.portfolio_entry_id, group);
    }

    const entriesWithAttachments = (entries || []).map((entry) => ({
        ...entry,
        attachments: attachmentsByEntry.get(entry.id) ?? [],
    }));

    return NextResponse.json({ entries: entriesWithAttachments });
}

export async function POST(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const userId = guard.session.user.id;

    let body: CreatePortfolioBody;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    if (!body.category || !VALID_CATEGORIES.includes(body.category)) {
        return NextResponse.json({ error: "invalid_category" }, { status: 400 });
    }

    const allowedTypes = PORTFOLIO_TYPES[body.category].map((t) => t.value);
    if (!body.type || !allowedTypes.includes(body.type)) {
        return NextResponse.json({ error: "invalid_type_for_category" }, { status: 400 });
    }

    if (!body.title?.trim() || !body.organisation?.trim() || !body.start_date || !body.reflection?.trim()) {
        return NextResponse.json({ error: "title, organisation, start_date, and reflection are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("portfolio_entries")
      .insert({
        user_id: userId,
        category: body.category,
        title: body.title.trim(),
        type: body.type,
        organisation: body.organisation.trim(),
        linked_specialty: body.linked_specialty?.trim() || null,
        start_date: body.start_date,
        end_date: body.end_date || null,
        reflection: body.reflection.trim(),
      })
      .select()
      .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ entry: data }, { status: 201 });
}
