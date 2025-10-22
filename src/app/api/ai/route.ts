import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// We only need the one prompt for summarizing now
const summarizationPrompt = `You are an SCP Foundation archival AI. Analyze the following SCP entry text and provide a summary in a formal, in-universe tone. Pay close attention to classification details.

Analyze this text:
---
{SCP_RAW_TEXT}
---

Provide the following information in this exact format:

Title: [The official title of the SCP]
Object Class: [Identify the current primary classification. Look for fields like "Object Class:", "Containment Class:", or similar ACS terms. If multiple classes are mentioned (e.g., due to updates or strikethrough text like ~~Old~~ New), prioritize the **last** one listed as the current class. Extract only the class name, e.g., Safe, Euclid, Keter, Thaumiel, Apollyon, Neutralised, Explained.]

Summary:
[A summary of its description and containment procedures in under 150 words.]

Related SCPs:
1. [SCP-XXXX: Brief reason for connection.]

Related Tales:
* [Title of Tale: Brief description of the tale.]`;


async function scrapeSCPWiki(scpId: string): Promise<string | null> {
  const paddedScpId = scpId.padStart(3, '0');
  const finalScpId = parseInt(scpId, 10) < 1000 ? paddedScpId : scpId;
  
  const url = `https://scp-wiki.wikidot.com/scp-${finalScpId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const html = await response.text();
    const $ = cheerio.load(html);
    const content = $('#page-content').text().replace(/\s+/g, ' ').trim();
    return content.substring(0, 8000); 

  } catch (error) {
    console.error(`Error scraping scp-${finalScpId}:`, error);
    return null;
  }
}

async function callAI(prompt: string): Promise<string> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3-8b-instruct`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      }
    );
    if (!response.ok) throw new Error('Cloudflare AI API request failed');
    const result = await response.json();
    return result.result?.response || 'AI failed to generate a response.';
}


export async function POST(request: Request) {
  try {
    // We only expect 'query' now
    const { query } = await request.json(); 
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    let scpNumber: string | null = null;

    const scpIdPattern = /(?:scp[\s-]*)?(\d+)/i;
    const match = query.match(scpIdPattern);
    if (match) {
      scpNumber = match[1];
    } else {
      return NextResponse.json({ summary: "Invalid SCP designation format. Please enter numbers only." });
    }

    if (!scpNumber) {
        return NextResponse.json({ summary: "Could not determine SCP designation." });
    }

    const rawText = await scrapeSCPWiki(scpNumber);
    if (!rawText) {
        return NextResponse.json({ summary: `DATA CORRUPTED: Cannot access file for SCP-${scpNumber}.` });
    }

    const summaryPrompt = summarizationPrompt.replace('{SCP_RAW_TEXT}', rawText);
    const aiSummaryText = await callAI(summaryPrompt);
    
    const titleMatch = aiSummaryText.match(/Title: (.*)/);
    const classMatch = aiSummaryText.match(/Object Class: (.*)/);

    const responsePayload = {
      title: titleMatch ? titleMatch[1].trim() : "Title Unknown",
      summary: aiSummaryText,
      metadata: {
        id: `scp-${scpNumber}`,
        object_class: classMatch ? classMatch[1].trim() : "Classification Unknown",
      },
    };

    return NextResponse.json(responsePayload);

  } catch (error) {
    console.error('Error in AI route:', error);
    return NextResponse.json({ error: 'Internal Server Error or AI service failed.' }, { status: 500 });
  }
}