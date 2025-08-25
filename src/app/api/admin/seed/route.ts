import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min: number, max: number) { return Math.round((Math.random() * (max - min) + min) * 100) / 100; }
function daysAgo(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); }

export async function POST(request: Request) {
  // Simple protection: require secret header
  const secret = process.env.SEED_SECRET;
  const header = request.headers.get('x-seed-secret') || '';
  if (!secret || header !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check counts
    const countOf = async (table: string) => {
      const { count, error } = await supabaseAdmin.from(table).select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    };

    const clientsCount = await countOf('clients');
    const propertiesCount = await countOf('properties');
    const matchesCount = await countOf('client_property_matches');
    const contractsCount = await countOf('contracts');

    // Seed clients
    const clientIds: string[] = [];
    if (clientsCount === 0) {
      const firstNames = ['John','Sarah','Michael','Emily','David','Olivia','Daniel','Sophia','Liam','Emma','Noah','Ava'];
      const lastNames = ['Smith','Johnson','Brown','Davis','Wilson','Moore','Taylor','Anderson','Thomas','Jackson'];
      const locations = ['Downtown','Uptown','Waterfront','Suburbs','City Center','West End','East Side'];
      const stages = ['LEAD','QUALIFIED','PROPERTY_MATCHED','VIEWING','NEGOTIATION','CONTRACT'];
      const priorities = ['low','medium','high'];
      const leads: any[] = [];
      for (let i=0;i<30;i++) {
        const first = pick(firstNames);
        const last = pick(lastNames);
        const id = crypto.randomUUID();
        clientIds.push(id);
        const budgetMin = randInt(200_000, 700_000);
        const budgetMax = budgetMin + randInt(50_000, 400_000);
        const created = daysAgo(randInt(5, 90));
        const updated = daysAgo(randInt(0, 4));
        leads.push({
          id,
          first_name: first,
          last_name: last,
          email: `${first.toLowerCase()}.${last.toLowerCase()}${randInt(1,999)}@example.com`,
          phone: `+1 (555) ${randInt(100,999)}-${randInt(1000,9999)}`,
          whatsapp_number: null,
          budget_min: budgetMin,
          budget_max: budgetMax,
          preferred_bedrooms: pick([1,2,3,4]),
          preferred_location: pick(locations),
          special_requirements: Math.random() < 0.2 ? 'Near park' : null,
          lead_source: pick(['Website','Referral','Social Media','Advertisement']),
          current_stage: pick(stages),
          priority_level: pick(priorities),
          assigned_agent: Math.random() < 0.7 ? pick(['sarah@heritage100.com','mike@heritage100.com','lisa@heritage100.com']) : null,
          created_at: created,
          updated_at: updated,
          last_contact_date: Math.random() < 0.6 ? daysAgo(randInt(1, 30)) : null,
          next_follow_up_date: Math.random() < 0.5 ? daysAgo(randInt(-10, 20)) : null,
          status: pick(['active','active','active','inactive'])
        });
      }
      const { error: cErr } = await supabaseAdmin.from('clients').insert(leads).select();
      if (cErr) throw cErr;
    } else {
      // Fetch some client ids to link
      const { data } = await supabaseAdmin.from('clients').select('id').limit(50);
      (data || []).forEach(r => clientIds.push(r.id));
    }

    // Seed properties
    const propertyIds: string[] = [];
    if (propertiesCount === 0) {
      const types = ['Condo','Apartment','Villa','Townhouse','Penthouse'];
      const locations = ['Downtown','Uptown','Waterfront','Suburbs','City Center','West End','East Side'];
      const statuses = ['planning','foundation','structure','finishing','completed'];
      const properties: any[] = [];
      for (let i=0;i<20;i++) {
        const id = crypto.randomUUID();
        propertyIds.push(id);
        const created = daysAgo(randInt(20, 180));
        const updated = daysAgo(randInt(0, 10));
        const completion = randInt(10, 100);
        properties.push({
          id,
          property_name: `${pick(['Sunset','Grand','Riverside','Emerald','Skyline','Harbor'])} ${pick(['Residences','Heights','Gardens','Place','Terrace'])}`,
          property_type: pick(types),
          bedrooms: pick([1,2,3,4,5]),
          bathrooms: pick([1,2,3]),
          square_feet: randInt(600, 4500),
          price: randInt(150_000, 2_000_000),
          location: pick(locations),
          description: Math.random() < 0.5 ? 'Modern living with premium amenities.' : null,
          amenities: Math.random() < 0.7 ? pick([['Pool','Gym'], ['Parking','Security'], ['Garden'], ['Elevator','Doorman']]) : null,
          construction_status: pick(statuses),
          completion_percentage: completion,
          estimated_completion_date: completion < 100 ? daysAgo(randInt(-180, 180)) : null,
          actual_completion_date: completion === 100 ? daysAgo(randInt(0, 60)) : null,
          images: null,
          floor_plan_url: null,
          virtual_tour_url: null,
          available: Math.random() < 0.7,
          created_at: created,
          updated_at: updated,
        });
      }
      const { error: pErr } = await supabaseAdmin.from('properties').insert(properties).select();
      if (pErr) throw pErr;
    } else {
      const { data } = await supabaseAdmin.from('properties').select('id').limit(50);
      (data || []).forEach(r => propertyIds.push(r.id));
    }

    // Ensure we have ids arrays populated
    if (clientIds.length === 0) {
      const { data } = await supabaseAdmin.from('clients').select('id').limit(50);
      (data || []).forEach(r => clientIds.push(r.id));
    }
    if (propertyIds.length === 0) {
      const { data } = await supabaseAdmin.from('properties').select('id').limit(50);
      (data || []).forEach(r => propertyIds.push(r.id));
    }

    // Seed matches
    if (matchesCount === 0 && clientIds.length && propertyIds.length) {
      const matches: any[] = [];
      for (let i=0;i<40;i++) {
        matches.push({
          id: crypto.randomUUID(),
          client_id: pick(clientIds),
          property_id: pick(propertyIds),
          match_score: randInt(50, 100),
          status: pick(['suggested','viewing_scheduled','offer_made','rejected']),
          viewing_date: Math.random() < 0.4 ? daysAgo(randInt(1, 45)) : null,
          offer_amount: Math.random() < 0.2 ? randInt(150_000, 1_500_000) : null,
          notes: Math.random() < 0.3 ? 'Client prefers higher floor.' : null,
          created_at: daysAgo(randInt(1, 60)),
          updated_at: daysAgo(randInt(0, 7)),
        });
      }
      const { error: mErr } = await supabaseAdmin.from('client_property_matches').insert(matches).select();
      if (mErr) throw mErr;
    }

    // Seed contracts
    if (contractsCount === 0 && clientIds.length && propertyIds.length) {
      const statuses = ['draft','pending_signature','active','completed','cancelled'];
      const types = ['sale','lease','rent_to_own'];
      const contracts: any[] = [];
      for (let i=0;i<12;i++) {
        const total = randInt(200_000, 1_800_000);
        const down = Math.round(total * randFloat(0.1, 0.3));
        contracts.push({
          id: crypto.randomUUID(),
          client_id: pick(clientIds),
          property_id: pick(propertyIds),
          contract_number: `CN-${randInt(10000, 99999)}`,
          contract_type: pick(types),
          total_amount: total,
          down_payment: down,
          contract_date: daysAgo(randInt(10, 200)),
          expected_completion_date: daysAgo(randInt(-90, 180)),
          contract_status: pick(statuses),
          contract_file_url: null,
          signed_date: Math.random() < 0.6 ? daysAgo(randInt(1, 60)) : null,
          terms_conditions: Math.random() < 0.4 ? 'Standard terms apply.' : null,
        });
      }
      const { error: kErr } = await supabaseAdmin.from('contracts').insert(contracts).select();
      if (kErr) throw kErr;
    }

    // Enrichment: ensure plausible cross-links and fill missing values
    // 1) Ensure each contracted client has a corresponding match linking to the same property
    try {
      const { data: kData } = await supabaseAdmin
        .from('contracts')
        .select('client_id, property_id, contract_status');

      if (kData && kData.length) {
        // Existing matches to avoid duplicates
        const { data: existingMatches } = await supabaseAdmin
          .from('client_property_matches')
          .select('client_id, property_id');
        const seen = new Set((existingMatches || []).map(m => `${m.client_id}:${m.property_id}`));

        const toInsert: any[] = [];
        const clientStageUpdates: any[] = [];
        for (const k of kData) {
          const key = `${k.client_id}:${k.property_id}`;
          if (!seen.has(key)) {
            toInsert.push({
              id: crypto.randomUUID(),
              client_id: k.client_id,
              property_id: k.property_id,
              match_score: randInt(70, 98),
              status: k.contract_status === 'completed' ? 'offer_made' : 'viewing_scheduled',
              viewing_date: daysAgo(randInt(2, 60)),
              offer_amount: null,
              notes: 'Auto-linked from contract',
              created_at: daysAgo(randInt(2, 60)),
              updated_at: daysAgo(randInt(0, 2)),
            });
          }
          // Stage alignment for clients with contracts
          const stage = k.contract_status === 'completed' ? 'HANDOVER' : k.contract_status === 'active' ? 'CONTRACT' : 'NEGOTIATION';
          clientStageUpdates.push({ id: k.client_id, current_stage: stage, updated_at: new Date().toISOString() });
        }
        if (toInsert.length) {
          await supabaseAdmin.from('client_property_matches').insert(toInsert);
        }
        if (clientStageUpdates.length) {
          await supabaseAdmin.from('clients').upsert(clientStageUpdates);
        }
      }
    } catch {}

    // 2) Seed interactions for clients that have none (baseline timeline)
    try {
      const { data: haveInter } = await supabaseAdmin
        .from('interactions')
        .select('client_id');
      const has = new Set((haveInter || []).map((r: any) => r.client_id));

      const need = (clientIds || []).filter(id => !has.has(id));
      if (need.length) {
        const agents = ['Sarah Johnson','Michael Brown','Lisa Chen','David Lee'];
        const interactions: any[] = [];
        for (const cid of need) {
          const who = pick(agents);
          interactions.push({
            id: crypto.randomUUID(),
            client_id: cid,
            interaction_type: 'phone',
            channel: 'phone',
            direction: 'inbound',
            subject: 'Initial Inquiry',
            message_content: 'Client called asking about available properties and budget fit.',
            attachments: [],
            agent_name: who,
            interaction_date: daysAgo(randInt(10, 40)),
            response_time_minutes: randInt(2, 15),
            sentiment: 'positive',
            tags: ['inquiry','initial_contact'],
            resolved: true,
            created_at: daysAgo(randInt(9, 39)),
            updated_at: daysAgo(randInt(1, 5)),
          });
          interactions.push({
            id: crypto.randomUUID(),
            client_id: cid,
            interaction_type: 'email',
            channel: 'gmail',
            direction: 'outbound',
            subject: 'Property Recommendations',
            message_content: 'Based on your requirements, here are matching properties. Please review the attached brochure.',
            attachments: [],
            agent_name: who,
            interaction_date: daysAgo(randInt(5, 20)),
            response_time_minutes: null,
            sentiment: 'positive',
            tags: ['property_recommendation','follow_up'],
            resolved: true,
            created_at: daysAgo(randInt(4, 19)),
            updated_at: daysAgo(randInt(1, 4)),
          });
        }
        if (interactions.length) {
          await supabaseAdmin.from('interactions').insert(interactions);
        }
      }
    } catch {}

    // 3) Fill missing values for clients and properties to avoid nulls/NaN in UI
    try {
      const { data: rawClients } = await supabaseAdmin.from('clients').select('*').limit(200);
      const cUpdates = (rawClients || []).filter((c: any) => !c.phone || !c.budget_min || !c.budget_max).map((c: any) => {
        const bmin = c.budget_min || randInt(200000, 700000);
        const bmax = c.budget_max || (bmin + randInt(50000, 400000));
        return {
          id: c.id,
          phone: c.phone || `+1 (555) ${randInt(100,999)}-${randInt(1000,9999)}`,
          budget_min: bmin,
          budget_max: bmax,
          updated_at: new Date().toISOString(),
        };
      });
      if (cUpdates.length) await supabaseAdmin.from('clients').upsert(cUpdates);

      const { data: rawProps } = await supabaseAdmin.from('properties').select('*').limit(200);
      const pUpdates = (rawProps || []).filter((p: any) => !p.price || !p.bedrooms || !p.bathrooms).map((p: any) => ({
        id: p.id,
        price: p.price || randInt(150000, 2000000),
        bedrooms: p.bedrooms || pick([1,2,3,4,5]),
        bathrooms: p.bathrooms || pick([1,2,3]),
        updated_at: new Date().toISOString(),
      }));
      if (pUpdates.length) await supabaseAdmin.from('properties').upsert(pUpdates);
    } catch {}

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Seed failed' }, { status: 500 });
  }
}
