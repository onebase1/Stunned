#!/usr/bin/env node

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or key');
  process.exit(1);
}

async function main() {
  try {
    const resp = await fetch(`${url}/rest/v1/clients?select=id&limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    const text = await resp.text();
    let data = [];
    try { data = JSON.parse(text); } catch {
      // ignore JSON parse errors if 0 rows
    }
    console.log('status', resp.status, 'rows', Array.isArray(data) ? data.length : 0);
  } catch (e) {
    console.error('check failed', e.message);
    process.exit(2);
  }
}

main();

