import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { triageLeadWithAI } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { action, leadIds, targetManager } = await request.json();

    if (action === 'clear' || action === 'reset') {
      await db.clearAll();
      const stats = await db.getStats();
      return NextResponse.json({ success: true, count: 0, stats });
    }

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: 'No lead IDs provided' }, { status: 400 });
    }

    if (action === 'delete') {
      await db.deleteLeads(leadIds);
      return NextResponse.json({ success: true, count: leadIds.length });
    }

    if (action === 'assign' && targetManager) {
      for (const id of leadIds) {
        await db.updateLead(id, {
          manager: targetManager,
          aiInsights: {
            tags: ['Manual Assignment'],
            urgency: 'Medium',
            domain: 'Manual Reassignment',
            assignedReason: `Reassigned manually by administrator to ${targetManager}.`,
            confidence: 100,
            autoAssigned: false,
          },
        });
      }
      return NextResponse.json({ success: true, count: leadIds.length });
    }

    if (action === 'ai-reassign') {
      const managers = await db.getManagers();
      for (const id of leadIds) {
        const lead = await db.getLeadById(id);
        if (lead) {
          const aiResult = await triageLeadWithAI(
            {
              customer: lead.customer,
              company: lead.company,
              focusArea: lead.focusArea,
              message: lead.message,
              email: lead.email,
            },
            managers
          );
          await db.updateLead(id, {
            manager: aiResult.assignedManagerName,
            score: aiResult.qualityScore,
            aiInsights: {
              tags: aiResult.tags,
              urgency: aiResult.urgency,
              domain: aiResult.domain,
              assignedReason: aiResult.assignedReason,
              confidence: aiResult.confidenceScore,
              autoAssigned: true,
              engine: aiResult.engine,
            },
          });
        }
      }
      return NextResponse.json({ success: true, count: leadIds.length });
    }

    return NextResponse.json({ error: 'Invalid batch action' }, { status: 400 });
  } catch (error) {
    console.error('Batch error:', error);
    return NextResponse.json({ error: 'Failed to process batch action' }, { status: 500 });
  }
}
