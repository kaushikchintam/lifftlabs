import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

/**
 * GET (the whole list of logged experience), POST (log button)
 */

interface AttachmentsRow {
    id: string,
    experience_id: string,
    storage_path: string,
    file_name: string,
    kind: string
}

interface AttachmentResponse extends Omit <AttachmentsRow, 'storage_path'> {
    signedUrl: string     //what the frontend part will actually see
}

interface CreateExperienceBody {
    exp_type: string,
    custom_exp_type?: string,
    activity_description?: string,
    organisation: string,
    location_site: string,
    setting?: string,
    duration_note?: string,
    supervisor?: string,
    evidence_reference?: string,
    is_recurring: boolean,
    start_date: string,
    end_date?: string,
    hours_per_period?: number,
    frequency_unit?: string,
    head_start_hours?: number,
    total_hours?: number
}

const VALID_EXP_TYPES = ["shadowing", "volunteering", "observation", "paid_care_work", "virtual_course", "other"];
const VALID_FREQUENCY_UNITS = ["week", "fortnight", "month"];

export async function GET (request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized"}, { status: 401})
    }
    const userId = guard.session.user.id;

    const { data: logs, error: logsError } = await supabaseAdmin
      .from('experience_log_with_hours')
      .select(`
        id, exp_type, custom_exp_type, activity_description, organisation, location_site, setting, duration_note, supervisor, evidence_reference, start_date, end_date, total_hours, live_hours
        `)
       .eq("user_id", userId)
       .order("created_at", { ascending: true })

       if (logsError) {
        return NextResponse.json({ error: logsError.message}, { status: 500});
       }

    const { data: attachments, error: attachmentsError } = await supabaseAdmin
        .from('experience_attachments')
        .select(`id, experience_id, file_name, storage_path, kind`)
        .eq("user_id", userId)

        if (attachmentsError) {
            return NextResponse.json({ error: attachmentsError.message }, { status: 500});
        }

        const safeAttachments = attachments || []; //safely handling the case where no attachments exist. 

       //map over attachments and generate a signed Url for each one
       const attachmentsWithURLs: AttachmentResponse[] = await Promise.all(
        safeAttachments.map(async(file: AttachmentsRow ) => {
            const { data, error: storageError } = await supabaseAdmin.storage
              .from("experience-attachments")
              .createSignedUrl(file.storage_path, 60 * 15);

              if (storageError) {
                console.error(`Storage error for ${file.storage_path}:`, storageError.message);
              }

              return {
                id: file.id,
                experience_id: file.experience_id,
                file_name: file.file_name,
                kind: file.kind,
                signedUrl: data?.signedUrl || ''
              };
        })
       );

       const attachmentsByExperience = new Map<string, AttachmentResponse[]>();
       for (const file of attachmentsWithURLs) {
        const group = attachmentsByExperience.get(file.experience_id) ?? [];
        group.push(file);
        attachmentsByExperience.set(file.experience_id, group);
       }
       
       const groupedLogs = (logs || []).map((log) => ({
        ...log, 
        attachments: attachmentsByExperience.get(log.id) ?? [],
       }));

       return NextResponse.json({ logs: groupedLogs });
}

export async function POST (request: NextRequest){
    const guard = await requireSession(request.headers);
    if(!guard.ok) {
        return NextResponse.json({error: "unauthorized"}, {status: 401 });
    }
    const userId = guard.session.user.id;

    let body: CreateExperienceBody;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    if (!body.exp_type || !VALID_EXP_TYPES.includes(body.exp_type)) {
        return NextResponse.json({ error: "invalid exp_type" }, { status: 400 });
    }
    if (body.exp_type === "other") {
        if (!body.custom_exp_type || !body.custom_exp_type.trim()) {
            return NextResponse.json({ error: "custom_exp_type required when exp_type is 'other'" }, { status: 400 });
        }
    } else if (body.custom_exp_type) {
        return NextResponse.json({ error: "custom_exp_type must be empty unless exp_type is 'other'" }, { status: 400 });
    }

    if (!body.organisation || !body.location_site || !body.start_date) {
        return NextResponse.json({ error: "organisation, location_site, and start_date are required" }, { status: 400 });
    }

    if (body.is_recurring) {
        if (body.hours_per_period == null || !body.frequency_unit || !VALID_FREQUENCY_UNITS.includes(body.frequency_unit)) {
            return NextResponse.json({ error: "recurring entries require hours_per_period and a valid frequency_unit" }, { status: 400 });
        }
        if (body.total_hours != null) {
            return NextResponse.json({ error: "recurring entries must not set total_hours" }, { status: 400 });
        }
    } else {
        if (body.total_hours == null) {
            return NextResponse.json({ error: "one-off entries require total_hours" }, { status: 400 });
        }
        if (body.hours_per_period != null || body.frequency_unit != null) {
            return NextResponse.json({ error: "one-off entries must not set hours_per_period or frequency_unit" }, { status: 400 });
        }
    }

    const { data, error } = await supabaseAdmin
      .from('experience_log')
      .insert({
        user_id: userId,
        exp_type: body.exp_type,
        custom_exp_type: body.exp_type === "other" ? body.custom_exp_type!.trim() : null,
        activity_description: body.activity_description ?? null,
        organisation: body.organisation,
        location_site: body.location_site,
        setting: body.setting ?? null,
        duration_note: body.duration_note ?? null,
        supervisor: body.supervisor ?? null,
        evidence_reference: body.evidence_reference ?? null,
        is_recurring: body.is_recurring,
        start_date: body.start_date,
        end_date: body.end_date ?? null,
        hours_per_period: body.is_recurring ? body.hours_per_period : null,
        frequency_unit: body.is_recurring ? body.frequency_unit : null,
        head_start_hours: body.head_start_hours ?? 0,
        total_hours: body.is_recurring ? null : body.total_hours,
      })
      .select()
      .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ log: data }, { status: 201 });
}