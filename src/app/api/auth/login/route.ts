import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim() || '';
    const password = body.password || '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Please enter both your work email and password.' },
        { status: 400 }
      );
    }

    const managers = await db.getManagers();
    const user = managers.find(
      (m) => m.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return NextResponse.json(
        { error: 'No account found matching this email address.' },
        { status: 401 }
      );
    }

    const expectedPassword = user.password || 'Password@123';
    if (password !== expectedPassword) {
      return NextResponse.json(
        { error: 'Incorrect password. Default password is Password@123' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        userRole: user.userRole || 'specialist',
        avatar: user.avatar,
        department: user.department,
        region: user.region,
        status: user.status,
        specialties: user.specialties,
        maxCapacity: user.maxCapacity,
        activeLeads: user.activeLeads,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication service error. Please try again.' },
      { status: 500 }
    );
  }
}
