import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { roles } = await request.json();

    if (!Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json(
        { error: 'Invalid roles array' },
        { status: 400 }
      );
    }

    // Create response and set roles cookie
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('roles', JSON.stringify(roles), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error setting roles cookie:', error);
    return NextResponse.json(
      { error: 'Failed to set roles' },
      { status: 500 }
    );
  }
}
