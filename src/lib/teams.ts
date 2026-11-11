import { Lead } from '@/types';

export type TeamsAlertEventType = 'NEW_LEAD' | 'STATUS_UPDATE' | 'CALL_SCHEDULED' | 'REASSIGNED';

interface SendTeamsOptions {
  previousStatus?: string;
  updatedBy?: string;
  customWebhookUrl?: string;
}

const DEFAULT_TEAMS_WEBHOOK =
  'https://default68cd811a8b0e4ca0aec966b397983a.9d.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/14/workflows/25ea9899bafe4acd95925ebfd206ff36/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=l1DgFE7xTD2eUgbSm_rxFhv3AMAh9_0OIk-IPANGcf8';

/**
 * Sends a rich Adaptive Card notification to a Microsoft Teams channel or group chat.
 * Uses the modern Microsoft Teams Power Automate / Workflows webhook format.
 */
export async function sendTeamsLeadAlert(
  lead: Lead,
  eventType: TeamsAlertEventType = 'NEW_LEAD',
  options: SendTeamsOptions = {}
): Promise<{ sent: boolean; reason?: string }> {
  const webhookUrl =
    options.customWebhookUrl?.trim() ||
    process.env.TEAMS_WEBHOOK_URL?.trim() ||
    DEFAULT_TEAMS_WEBHOOK;

  if (!webhookUrl) {
    // Gracefully skip if no Teams webhook URL is configured
    return { sent: false, reason: 'TEAMS_WEBHOOK_URL not configured' };
  }

  const portalBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.PORTAL_BASE_URL ||
    'http://localhost:3000';

  const portalLeadUrl = `${portalBaseUrl.replace(/\/+$/, '')}/?tab=leads&leadId=${lead.id}`;

  let title = '🚀 New Lead Received — LeadManager';
  let themeColor = '6C47FF'; // Purple default

  if (eventType === 'STATUS_UPDATE') {
    title = `🔄 Lead Status Updated: ${lead.customer}`;
    themeColor = lead.status === 'HOT' ? 'EF4444' : '3B82F6';
  } else if (eventType === 'CALL_SCHEDULED') {
    title = `📞 Discovery Call Scheduled: ${lead.customer}`;
    themeColor = '10B981';
  } else if (eventType === 'REASSIGNED') {
    title = `👤 Lead Reassigned: ${lead.customer}`;
    themeColor = 'F97316';
  }

  const facts: Array<{ title: string; value: string }> = [
    { title: 'Customer:', value: lead.customer || 'N/A' },
    { title: 'Company:', value: lead.company || 'N/A' },
    { title: 'Email:', value: lead.email || 'N/A' },
    { title: 'Phone:', value: lead.phone || 'N/A' },
    { title: 'Status:', value: `${lead.status}${lead.status === 'HOT' ? ' 🔥' : ''}` },
    { title: 'AI Score:', value: `${lead.score || 8} / 10` },
    { title: 'Assigned Specialist:', value: lead.manager || 'Unassigned' },
    { title: 'Source:', value: lead.source || 'Website' },
  ];

  if (options.previousStatus && options.previousStatus !== lead.status) {
    facts.push({
      title: 'Previous Status:',
      value: options.previousStatus,
    });
  }

  if (lead.scheduledCall) {
    facts.push({
      title: 'Meeting Time:',
      value: `${lead.scheduledCall.date} at ${lead.scheduledCall.time} (${lead.scheduledCall.type || 'Call'})`,
    });
  }

  // Adaptive Card Body elements
  const cardBody: any[] = [
    {
      type: 'TextBlock',
      size: 'Medium',
      weight: 'Bolder',
      text: title,
      color: 'Accent',
    },
    {
      type: 'FactSet',
      facts: facts,
    },
  ];

  // Add Message if present
  if (lead.message) {
    cardBody.push({
      type: 'TextBlock',
      text: `**Customer Message:**\n"${lead.message}"`,
      wrap: true,
      spacing: 'Medium',
    });
  }

  // Add AI Insights if present
  if (lead.aiInsights) {
    const reason = lead.aiInsights.assignedReason
      ? `\n\n*${lead.aiInsights.assignedReason}*`
      : '';
    cardBody.push({
      type: 'Container',
      style: 'emphasis',
      items: [
        {
          type: 'TextBlock',
          text: `🤖 **Gemini AI Triage** (${lead.aiInsights.engine || 'Gemini AI'}) • Urgency: **${lead.aiInsights.urgency || 'Normal'}**${reason}`,
          wrap: true,
          size: 'Small',
        },
      ],
    });
  }

  // Construct Microsoft Adaptive Card Payload
  const payload = {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        contentUrl: null,
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.4',
          msteams: {
            width: 'Full',
          },
          body: cardBody,
          actions: [
            {
              type: 'Action.OpenUrl',
              title: 'View Lead in Portal',
              url: portalLeadUrl,
            },
          ],
        },
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`[TeamsWebhook] Non-OK response (${res.status}):`, errText);
      return { sent: false, reason: `Teams HTTP ${res.status}: ${errText}` };
    }

    return { sent: true };
  } catch (err) {
    console.error('[TeamsWebhook] Network error posting to Teams:', err);
    return { sent: false, reason: String(err) };
  }
}

/**
 * Sends a test ping to verify Microsoft Teams webhook connectivity.
 */
export async function testTeamsConnection(webhookUrl: string): Promise<{ success: boolean; message: string }> {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return { success: false, message: 'Invalid Webhook URL provided.' };
  }

  const mockLead: Lead = {
    id: `test-lead-${Date.now()}`,
    customer: 'Sarah Connor (Test)',
    company: 'Cyberdyne Systems',
    email: 'sarah.connor@example.com',
    phone: '+1 555-019-2834',
    status: 'HOT',
    manager: 'Admin',
    source: 'Website',
    score: 9,
    created: new Date().toLocaleDateString('en-US'),
    message: 'Testing Microsoft Teams notification integration from LeadManager.',
    aiInsights: {
      tags: ['Cloud', 'AI', 'Test'],
      urgency: 'High',
      domain: 'Cloud Transformation',
      assignedReason: 'Test notification triggered manually from LeadManager.',
      confidence: 99,
      autoAssigned: true,
      engine: 'Google Gemini 3.1 Flash-Lite',
    },
  };

  const result = await sendTeamsLeadAlert(mockLead, 'NEW_LEAD', { customWebhookUrl: webhookUrl });

  if (result.sent) {
    return { success: true, message: 'Test message sent successfully to Microsoft Teams!' };
  } else {
    return { success: false, message: result.reason || 'Failed to send message to Teams.' };
  }
}
