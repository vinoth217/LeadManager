import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendTeamsLeadAlert } from '@/lib/teams';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const existing = await db.getLeadById(params.id);
    const updated = await db.updateLead(params.id, body);

    if (!updated) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Check if status, manager, or scheduled call changed and notify Teams (awaited for serverless safety)
    if (existing) {
      try {
        if (body.status && body.status !== existing.status) {
          await sendTeamsLeadAlert(updated, 'STATUS_UPDATE', {
            previousStatus: existing.status,
          });
        } else if (body.manager && body.manager !== existing.manager) {
          await sendTeamsLeadAlert(updated, 'REASSIGNED');
        } else if (body.scheduledCall && JSON.stringify(body.scheduledCall) !== JSON.stringify(existing.scheduledCall)) {
          await sendTeamsLeadAlert(updated, 'CALL_SCHEDULED');
        }
      } catch (err) {
        console.error('[TeamsAlert] Failed update alert:', err);
      }
    }

    return NextResponse.json({ success: true, lead: updated });
  } catch (err) {
    console.error('API /leads/[id] PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update lead', details: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.deleteLeads([params.id]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
