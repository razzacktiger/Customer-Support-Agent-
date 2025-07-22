import { NextResponse } from 'next/server';
import { validateEnvironment, getClientSafeConfig } from '../../../config/security';

export async function GET(request: Request) {
  try {
    // Security: Only allow requests from your domain
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    
    // Allow localhost for development and your ngrok domain
    const allowedOrigins = [
      'http://localhost:3000',
      'https://loving-coherent-pheasant.ngrok-free.app',
      // Add your production domain here when deployed
    ];
    
    const isAllowedOrigin = allowedOrigins.some(allowed => 
      origin?.includes(allowed) || referer?.includes(allowed)
    );
    
    if (!isAllowedOrigin) {
      console.warn('🚨 Unauthorized config access attempt from:', origin || referer || 'unknown');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Validate environment variables
    validateEnvironment();
    
    // Get client-safe configuration
    const config = getClientSafeConfig();

    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { error: 'Service configuration error' },
      { status: 500 }
    );
  }
}
