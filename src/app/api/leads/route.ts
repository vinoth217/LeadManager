import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { triageLeadWithAI } from '@/lib/gemini';
import { Lead, LeadSource, LeadStatus } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');
  const query = searchParams.get('q')?.toLowerCase() || '';
  const user = searchParams.get('user');
  const role = searchParams.get('role');

  const isAdmin = role === 'admin';

  let leads = await db.getLeads();

  // Non-admin specialists/members strictly see their own assigned leads
  if (!isAdmin && user) {
    leads = leads.filter(l => (l.manager || '').trim().toLowerCase() === user.trim().toLowerCase());
  }

  if (query) {
    leads = leads.filter(l =>
      l.customer.toLowerCase().includes(query) ||
      l.company.toLowerCase().includes(query) ||
      l.email.toLowerCase().includes(query) ||
      (l.manager || '').toLowerCase().includes(query)
    );
  }

  if (statusFilter && statusFilter !== 'All') {
    if (statusFilter === 'Favourite') {
      leads = leads.filter(l => l.isFavourite);
    } else if (statusFilter === 'Assigned to me') {
      const targetUser = user || 'Admin';
      leads = leads.filter(l => (l.manager || '').trim().toLowerCase() === targetUser.trim().toLowerCase());
    } else if (statusFilter === 'Overdue') {
      leads = leads.filter(l => l.isOverdue || l.status === 'PENDING');
    } else if (statusFilter === 'Hot') {
      leads = leads.filter(l => l.status === 'HOT');
    } else if (statusFilter === 'New') {
      leads = leads.filter(l => l.status === 'NEW');
    }
  }

  const stats = await db.getStats(!isAdmin && user ? user : undefined);
  const managers = await db.getManagers();

  return NextResponse.json({
    leads,
    stats,
    managers,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const firstName = body.firstName || '';
    const lastName = body.lastName || '';
    const customer = body.customer || `${firstName} ${lastName}`.trim() || 'Anonymous Lead';
    const company = body.company || 'Direct Inquiry';
    const email = body.email || 'inquiry@example.com';
    const phone = body.phone || '';
    const focusArea = body.focusArea || 'Digital Transformation';
    const message = body.message || '';
    const source: LeadSource = body.source || 'Website';

    const managers = await db.getManagers();

    // Perform AI triage and intelligent assignment
    const aiResult = await triageLeadWithAI(
      { customer, company, focusArea, message, email },
      managers
    );

    // Determine initial status based on score / urgency
    let initialStatus: LeadStatus = 'NEW';
    if (aiResult.qualityScore >= 8 || aiResult.urgency === 'Critical') {
      initialStatus = 'HOT';
    } else if (aiResult.qualityScore >= 6) {
      initialStatus = 'OPEN';
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      customer,
      company,
      email,
      phone,
      status: initialStatus,
      manager: aiResult.assignedManagerName,
      source,
      score: aiResult.qualityScore,
      created: formattedDate,
      focusArea,
      message,
      isFavourite: false,
      aiInsights: {
        tags: aiResult.tags,
        urgency: aiResult.urgency,
        domain: aiResult.domain,
        assignedReason: aiResult.assignedReason,
        confidence: aiResult.confidenceScore,
        autoAssigned: true,
        engine: aiResult.engine,
      },
    };

    await db.addLead(newLead);

    return NextResponse.json({
      success: true,
      lead: newLead,
      message: `Lead successfully triaged and assigned to ${aiResult.assignedManagerName}!`,
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: 'Failed to process lead intake' }, { status: 500 });
  }
}
