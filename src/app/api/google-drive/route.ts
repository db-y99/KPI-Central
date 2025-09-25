import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { withSecurity, createSuccessResponse, createErrorResponse, authRateLimit, logApiAccess } from '@/lib/api-security';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_DRIVE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_DRIVE_REDIRECT_URI || process.env.GOOGLE_OAUTH_REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
];

async function handleGoogleDriveAuth(request: NextRequest, user?: any) {
  try {
    logApiAccess(request, user, 'google-drive-auth');
    
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return createErrorResponse('Authorization failed', 400, { error });
    }

    if (!code) {
      // Generate authorization URL
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
      });

      return createSuccessResponse({ authUrl }, 'Authorization URL generated');
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Test the connection by listing files
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const response = await drive.files.list({
      pageSize: 1,
      fields: 'files(id,name)',
    });

    return createSuccessResponse({
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date
      },
      testResult: {
        filesFound: response.data.files?.length || 0,
        sampleFile: response.data.files?.[0]?.name || 'No files found'
      }
    }, 'Google Drive connected successfully');

  } catch (error) {
    console.error('Google Drive auth error:', error);
    return createErrorResponse(
      'Authentication failed',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export const GET = withSecurity(handleGoogleDriveAuth, {
  requireAuth: true,
  requireRole: 'admin',
  rateLimit: authRateLimit
});

async function handleGoogleDriveActions(request: NextRequest, user?: any) {
  try {
    logApiAccess(request, user, 'google-drive-actions');
    
    const body = await request.json();
    const { action, tokens } = body;

    if (action === 'test-connection') {
      const refreshToken = tokens?.refresh_token || 
                          process.env.GOOGLE_DRIVE_REFRESH_TOKEN || 
                          process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
      
      if (!refreshToken) {
        return createErrorResponse('No refresh token provided', 400);
      }

      // Set credentials and test connection
      oauth2Client.setCredentials({
        refresh_token: refreshToken
      });

      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      const response = await drive.files.list({
        pageSize: 5,
        fields: 'files(id,name,size,mimeType,createdTime)',
        orderBy: 'createdTime desc'
      });

      return createSuccessResponse({
        filesCount: response.data.files?.length || 0,
        files: response.data.files || []
      }, 'Connection test successful');
    }

    if (action === 'create-folder') {
      const { folderName, parentFolderId } = body;
      
      const refreshToken = tokens?.refresh_token || 
                          process.env.GOOGLE_DRIVE_REFRESH_TOKEN || 
                          process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
      
      if (!refreshToken) {
        return createErrorResponse('No refresh token provided', 400);
      }

      oauth2Client.setCredentials({
        refresh_token: refreshToken
      });

      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      const response = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: parentFolderId ? [parentFolderId] : undefined,
        },
        fields: 'id,name,webViewLink',
      });

      return createSuccessResponse({
        id: response.data.id,
        name: response.data.name,
        webViewLink: response.data.webViewLink
      }, 'Folder created successfully');
    }

    if (action === 'check-config') {
      // Check if all required environment variables are set
      const config = {
        clientId: !!(process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID),
        clientSecret: !!(process.env.GOOGLE_DRIVE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET),
        redirectUri: !!(process.env.GOOGLE_DRIVE_REDIRECT_URI || process.env.GOOGLE_OAUTH_REDIRECT_URI),
        refreshToken: !!(process.env.GOOGLE_DRIVE_REFRESH_TOKEN || process.env.GOOGLE_OAUTH_REFRESH_TOKEN),
        folderId: !!(process.env.GOOGLE_DRIVE_FOLDER_ID)
      };

      const allConfigured = Object.values(config).every(Boolean);

      return createSuccessResponse({
        config,
        allConfigured
      }, allConfigured ? 'Configuration complete' : 'Configuration incomplete');
    }

    return createErrorResponse('Invalid action', 400);

  } catch (error) {
    console.error('Google Drive API error:', error);
    return createErrorResponse(
      'API request failed',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export const POST = withSecurity(handleGoogleDriveActions, {
  requireAuth: true,
  requireRole: 'admin',
  rateLimit: authRateLimit
});