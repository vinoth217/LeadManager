import { NextResponse } from 'next/server';
import { testTeamsConnection } from '@/lib/teams';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const webhookUrl = body.webhookUrl || process.env.TEAMS_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, message: 'No TEAMS_WEBHOOK_URL configured.' },
        { status: 400 }
      );
    }

    const result = await testTeamsConnection(webhookUrl);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, message: String(err) },
      { status: 500 }
    );
  }
}
