import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { triageLeadWithAI } from '@/lib/gemini';
import { Lead, LeadSource, LeadStatus } from '@/types';

const SAMPLE_CLIENTS = [
  { name: 'Dr. Linda Sterling', company: 'Aura Health Systems', email: 'linda.s@aurahealth.org', phone: '+1 617 555 0192', focus: 'Cloud Solutions', message: 'We need HIPAA-compliant cloud migration for healthcare records on AWS with real-time patient analytics and zero-downtime failover.', tags: ['AWS', 'HIPAA', 'Cloud Migration', 'Healthcare'], urgency: 'Critical', domain: 'Healthcare Cloud' },
  { name: 'Marcus Vance', company: 'Nexura FinTech', email: 'marcus.v@nexurafin.com', phone: '+1 212 555 0188', focus: 'AI & GenAI Solutions', message: 'Looking to embed custom RAG pipelines and Gemini LLM agents into our algorithmic trading and customer risk analysis platform.', tags: ['GenAI', 'LLM', 'RAG', 'Vector Search'], urgency: 'High', domain: 'FinTech AI' },
  { name: 'Elena Rostova', company: 'BioCore Diagnostics', email: 'elena@biocorelabs.io', phone: '+44 20 7946 0833', focus: 'Testing Services', message: 'Seeking automated regression and performance QA testing with Playwright for our FDA-approved medical diagnostic portal.', tags: ['QA Automation', 'Playwright', 'FDA Compliance'], urgency: 'High', domain: 'Quality Engineering' },
  { name: 'Kenji Sato', company: 'SwiftDash Delivery', email: 'kenji@swiftdash.jp', phone: '+81 3 5555 0144', focus: 'Mobile App Development', message: 'Need a production-grade Flutter application for iOS and Android with live GPS delivery tracking and Apple Pay/Google Pay integration.', tags: ['Flutter', 'iOS/Android', 'Geolocation', 'Payments'], urgency: 'Critical', domain: 'Mobile Engineering' },
  { name: 'Seraphina Ross', company: 'Cognitive Legal', email: 's.ross@cognitivelegal.com', phone: '+1 415 555 0122', focus: 'AI & GenAI Solutions', message: 'We want to automate contract clause comparisons and risk anomaly detection across 50,000 corporate merger legal archives.', tags: ['NLP', 'LegalTech', 'Gemini AI', 'Document AI'], urgency: 'High', domain: 'Enterprise AI' },
  { name: 'Alexander Wright', company: 'Vanguard Global Logistics', email: 'alex.w@vanguardlog.com', phone: '+1 713 555 0177', focus: 'Enterprise Logistics', message: 'Integrate real-time warehouse telematics and RFID shipping containers into our SAP S/4HANA backbone with automated re-routing.', tags: ['SAP S/4HANA', 'Logistics', 'IoT Telematics'], urgency: 'Medium', domain: 'Supply Chain Tech' },
  { name: 'Chloe Bennett', company: 'OmniRetail Brands', email: 'chloe.b@omniretail.com', phone: '+1 312 555 0165', focus: 'Product Engineering Services', message: 'Re-architecting our multi-brand e-commerce marketplace for 2 million daily shoppers ahead of our holiday flash sales.', tags: ['Microservices', 'eCommerce', 'High Availability'], urgency: 'Critical', domain: 'Digital Engineering' },
  { name: 'Rajesh Ramanathan', company: 'Quantum Smart Grids', email: 'rajesh@quantumgrid.in', phone: '+91 80 4123 4567', focus: 'IoT & Smart Systems', message: 'Need embedded firmware optimization and MQTT telemetry ingestion for 500,000 smart industrial electricity meters.', tags: ['IoT', 'MQTT', 'Firmware', 'Smart Energy'], urgency: 'High', domain: 'Smart Systems' },
  { name: 'Nadia Al-Mansoor', company: 'Skyline Media Hub', email: 'nadia@skylinemedia.ae', phone: '+971 4 321 9876', focus: 'UI/UX Design', message: 'Require a comprehensive enterprise design system and Figma tokenized UI components for our global streaming platform.', tags: ['UI/UX', 'Figma', 'Design Systems'], urgency: 'Medium', domain: 'Product Design' },
  { name: 'Lucas Silva', company: 'HyperStream Gaming', email: 'lucas@hyperstream.gg', phone: '+55 11 98765 4321', focus: 'Product Engineering Services', message: 'Building a distributed low-latency matchmaking server with WebSocket clustering handling 100,000 concurrent players.', tags: ['Distributed Systems', 'WebSockets', 'Low Latency'], urgency: 'High', domain: 'High-Scale Infrastructure' },
  { name: 'Isabelle Moreau', company: 'Parisian Luxury Co.', email: 'isabelle@luxeparis.fr', phone: '+33 1 42 68 55 00', focus: 'Mobile App Development', message: 'Exclusive member-only iOS app with AR virtual try-on powered by ARKit and biometrics authentication.', tags: ['iOS Swift', 'ARKit', 'Biometrics'], urgency: 'High', domain: 'Mobile Engineering' },
  { name: 'David Chen', company: 'Apex Cloud Systems', email: 'david@apexcloud.sg', phone: '+65 6789 0123', focus: 'Cloud Solutions', message: 'Multi-cloud disaster recovery setup spanning AWS and Azure with automated Terraform configuration and SOC 2 audits.', tags: ['AWS', 'Azure', 'Terraform', 'SOC 2'], urgency: 'Critical', domain: 'Cloud Architecture' },
];

export async function POST() {
  try {
    const managers = await db.getManagers();

    // Shuffle and pick 10 random clients
    const shuffled = [...SAMPLE_CLIENTS].sort(() => 0.5 - Math.random()).slice(0, 10);

    const sources: LeadSource[] = ['Website', 'LinkedIn', 'Referral', 'X', 'Facebook'];
    const statuses: LeadStatus[] = ['HOT', 'OPEN', 'NEW', 'QUALIFIED', 'IN PROGRESS'];

    const today = new Date();

    // Process all 10 leads concurrently for maximum responsiveness
    const generatedLeads: Lead[] = await Promise.all(
      shuffled.map(async (client, i) => {
        const randomDaysAgo = Math.floor(Math.random() * 5);
        const leadDate = new Date(today.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);
        const formattedDate = leadDate.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        });

        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const randomSource = sources[Math.floor(Math.random() * sources.length)];

        // Evaluate and triage with Gemini AI against team specialists
        const aiResult = await triageLeadWithAI(
          {
            customer: client.name,
            company: client.company,
            focusArea: client.focus,
            message: client.message,
            email: client.email,
          },
          managers
        );

        return {
          id: `lead-${Date.now()}-${i}`,
          customer: client.name,
          company: client.company,
          email: client.email,
          phone: client.phone,
          status: randomStatus,
          manager: aiResult.assignedManagerName,
          source: randomSource,
          score: aiResult.qualityScore,
          created: formattedDate,
          focusArea: client.focus,
          message: client.message,
          isFavourite: Math.random() > 0.5,
          aiInsights: {
            tags: aiResult.tags,
            urgency: aiResult.urgency,
            domain: aiResult.domain,
            assignedReason: aiResult.assignedReason,
            confidence: aiResult.confidenceScore,
            autoAssigned: true,
            engine: aiResult.engine,
          },
        };
      })
    );

    // Save all leads to database
    for (const lead of generatedLeads) {
      await db.addLead(lead);
    }

    const stats = await db.getStats();

    return NextResponse.json({
      success: true,
      count: generatedLeads.length,
      leads: generatedLeads,
      stats,
      message: 'Successfully generated 10 enterprise leads!',
    });
  } catch (error) {
    console.error('Failed to generate leads:', error);
    return NextResponse.json({ error: 'Failed to generate leads' }, { status: 500 });
  }
}
