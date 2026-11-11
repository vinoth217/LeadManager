import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await db.updateManager(params.id, body);

    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, manager: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (params.id === 'admin') {
      return NextResponse.json({ error: 'Primary Admin cannot be deleted' }, { status: 400 });
    }

    const success = await db.deleteManager(params.id);
    if (!success) {
      return NextResponse.json({ error: 'User not found or protected' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
