import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Manager } from '@/types';

export async function GET() {
  const managers = await db.getManagers();
  return NextResponse.json({
    managers,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

    const isRoleAdmin = body.userRole === 'admin';
    const defaultAvatar = body.avatar && body.avatar.trim() !== ''
      ? body.avatar
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(body.name)}&background=${isRoleAdmin ? '0f172a' : 'ff6937'}&color=ffffff&bold=true&size=128`;

    const newManager: Manager = {
      id: `usr-${Date.now()}`,
      name: body.name,
      role: body.role || 'Solutions Specialist',
      avatar: defaultAvatar,
      email: body.email,
      password: body.password || 'Password@123',
      phone: body.phone || '+1 (555) 000-0000',
      userRole: body.userRole || 'specialist',
      status: body.status || 'Active',
      department: body.department || 'Digital Engineering',
      specialties: Array.isArray(body.specialties) && body.specialties.length > 0
        ? body.specialties
        : ['Product Engineering'],
      region: body.region || 'North America',
      activeLeads: 0,
      maxCapacity: Number(body.maxCapacity) || 10,
      joinedDate: formattedDate,
    };

    await db.addManager(newManager);

    return NextResponse.json({
      success: true,
      manager: newManager,
      message: `${newManager.name} added to the team directory!`,
    });
  } catch (error) {
    console.error('Error adding user:', error);
    return NextResponse.json({ error: 'Failed to add user' }, { status: 500 });
  }
}
