import { EmailMessage } from '../store/useAppStore';

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

export async function fetchUnreadEmails(
  accessToken: string,
  sources: string[]
): Promise<EmailMessage[]> {
  if (!sources.length) return [];

  // Construct query: from:(sourceA OR sourceB) is:unread
  const sourceQuery = sources.map((s) => `from:${s}`).join(' OR ');
  const query = `(${sourceQuery}) is:unread`;

  const url = new URL(`${GMAIL_API_BASE}/messages`);
  url.searchParams.append('q', query);
  url.searchParams.append('maxResults', '20');

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error('Failed to fetch messages list');
  }

  const data = await response.json();
  const messages = data.messages || [];

  if (!messages.length) return [];

  // Fetch details for each message
  const detailedMessages = await Promise.all(
    messages.map((msg: { id: string }) => fetchEmailDetails(accessToken, msg.id))
  );

  return detailedMessages.filter((msg): msg is EmailMessage => msg !== null);
}

async function fetchEmailDetails(
  accessToken: string,
  messageId: string
): Promise<EmailMessage | null> {
  const response = await fetch(`${GMAIL_API_BASE}/messages/${messageId}?format=full`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) return null;

  const data = await response.json();
  const headers = data.payload?.headers || [];

  const getHeader = (name: string) =>
    headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const sender = getHeader('from');
  const subject = getHeader('subject');
  const dateStr = getHeader('date');
  const date = dateStr ? new Date(dateStr).getTime() : Date.now();

  let bodyHtml = '';
  let bodyPlain = '';

  const parseParts = (parts: any[]) => {
    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        bodyPlain = decodeBase64(part.body.data);
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        bodyHtml = decodeBase64(part.body.data);
      } else if (part.parts) {
        parseParts(part.parts);
      }
    }
  };

  if (data.payload?.parts) {
    parseParts(data.payload.parts);
  } else if (data.payload?.body?.data) {
    if (data.payload.mimeType === 'text/html') {
      bodyHtml = decodeBase64(data.payload.body.data);
    } else {
      bodyPlain = decodeBase64(data.payload.body.data);
    }
  }

  return {
    id: data.id,
    threadId: data.threadId,
    snippet: data.snippet,
    sender,
    subject,
    date,
    isUnread: data.labelIds?.includes('UNREAD') || false,
    bodyHtml,
    bodyPlain,
  };
}

export async function markAsRead(accessToken: string, messageId: string): Promise<void> {
  const response = await fetch(`${GMAIL_API_BASE}/messages/${messageId}/modify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      removeLabelIds: ['UNREAD'],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gmail API Error:', response.status, errorText);
    
    if (response.status === 403) {
      throw new Error('Missing permissions to modify emails. Please log out, log back in, and check the box to allow LeadStream to modify emails.');
    } else if (response.status === 401) {
      throw new Error('Session expired. Please log out and log back in.');
    }
    
    throw new Error('Failed to mark message as read');
  }
}

function decodeBase64(encoded: string) {
  try {
    // Replace URL-safe base64 characters
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (e) {
    console.error('Failed to decode base64', e);
    return '';
  }
}
