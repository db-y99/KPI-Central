import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_DRIVE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_DRIVE_REDIRECT_URI || process.env.GOOGLE_OAUTH_REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authorization failed',
        message: error 
      }, { status: 400 });
    }

    if (!code) {
      // Generate authorization URL
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
      });

      return NextResponse.json({ 
        success: true, 
        authUrl,
        message: 'Authorization URL generated' 
      });
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

    return NextResponse.json({
      success: true,
      message: 'Google Drive connected successfully',
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date
      },
      testResult: {
        filesFound: response.data.files?.length || 0,
        sampleFile: response.data.files?.[0]?.name || 'No files found'
      }
    });

  } catch (error) {
    console.error('Google Drive auth error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tokens } = body;

    if (action === 'test-connection') {
      const refreshToken = tokens?.refresh_token || 
                          process.env.GOOGLE_DRIVE_REFRESH_TOKEN || 
                          process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
      
      if (!refreshToken) {
        return NextResponse.json({ 
          success: false, 
          error: 'No refresh token provided' 
        }, { status: 400 });
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

      return NextResponse.json({
        success: true,
        message: 'Connection test successful',
        data: {
          filesCount: response.data.files?.length || 0,
          files: response.data.files || []
        }
      });
    }

    if (action === 'create-folder') {
      const { folderName, parentFolderId } = body;
      
      const refreshToken = tokens?.refresh_token || 
                          process.env.GOOGLE_DRIVE_REFRESH_TOKEN || 
                          process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
      
      if (!refreshToken) {
        return NextResponse.json({ 
          success: false, 
          error: 'No refresh token provided' 
        }, { status: 400 });
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

      return NextResponse.json({
        success: true,
        message: 'Folder created successfully',
        data: {
          id: response.data.id,
          name: response.data.name,
          webViewLink: response.data.webViewLink
        }
      });
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

      return NextResponse.json({
        success: true,
        message: allConfigured ? 'Configuration complete' : 'Configuration incomplete',
        config,
        allConfigured
      });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Invalid action' 
    }, { status: 400 });

  } catch (error) {
    console.error('Google Drive API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'API request failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}