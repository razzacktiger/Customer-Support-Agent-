import { NextResponse } from 'next/server';
import { validateEnvironment, getClientSafeConfig } from '../../../config/security';

export async function GET() {
  try {
    // Validate environment variables
    validateEnvironment();
    
    // Get client-safe configuration
    const config = getClientSafeConfig();

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { error: 'Service configuration error' },
      { status: 500 }
    );
  }
}
