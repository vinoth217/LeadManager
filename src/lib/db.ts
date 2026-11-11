import { Pool, PoolConfig } from 'pg';
import {
  Lead,
  Manager,
  LeadStats,
  LeadStatus,
  LeadSource,
  UserSystemRole,
  UserStatus,
} from '@/types';
import { INITIAL_MANAGERS } from '@/lib/constants';

// Normalizes database connection string (handles raw '@' inside passwords)
export function normalizeDatabaseUrl(rawUrl?: string): string {
  const urlStr =
    rawUrl ||
    process.env.DATABASE_URL ||
    'postgresql://postgres:user%40123@localhost:5432/lead217';

  try {
    const match = urlStr.match(/^postgresql:\/\/([^:]+):(.*)@([^@]+:\d+\/.*)$/);
    if (match) {
      const user = match[1];
      const pass = match[2];
      const rest = match[3];
      return `postgresql://${user}:${encodeURIComponent(decodeURIComponent(pass))}@${rest}`;
    }
  } catch {
    // fallback to original if parsing fails
  }
  return urlStr;
}

// Global connection pool singleton across Next.js invocations
declare global {
  // eslint-disable-next-line no-var
  var __pgPoolInstance: Pool | undefined;
  // eslint-disable-next-line no-var
  var __pgTablesInitialized: boolean | undefined;
}

function getPool(): Pool {
  if (!global.__pgPoolInstance) {
    const connectionString = normalizeDatabaseUrl();
    global.__pgPoolInstance = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return global.__pgPoolInstance;
}

export { INITIAL_MANAGERS };

// Helper to map DB row to Lead interface
function mapRowToLead(r: any): Lead {
  let aiInsights = r.ai_insights;
  if (typeof aiInsights === 'string') {
    try {
      aiInsights = JSON.parse(aiInsights);
    } catch {
      aiInsights = undefined;
    }
  }

  let scheduledCall = r.scheduled_call;
  if (typeof scheduledCall === 'string') {
    try {
      scheduledCall = JSON.parse(scheduledCall);
    } catch {
      scheduledCall = undefined;
    }
  }

  return {
    id: r.id,
    customer: r.customer,
    company: r.company,
    email: r.email,
    phone: r.phone || '',
    status: r.status as LeadStatus,
    manager: r.manager,
    managerId: r.manager_id || undefined,
    source: (r.source as LeadSource) || 'Website',
    score: Number(r.score) || 7,
    created: r.created,
    focusArea: r.focus_area || '',
    message: r.message || '',
    isFavourite: Boolean(r.is_favourite),
    isOverdue: Boolean(r.is_overdue),
    scheduledCall: scheduledCall || undefined,
    aiInsights: aiInsights || undefined,
  };
}

// Helper to map DB row to Manager interface
function mapRowToManager(r: any): Manager {
  let specialties = r.specialties;
  if (typeof specialties === 'string') {
    try {
      specialties = JSON.parse(specialties);
    } catch {
      specialties = ['Product Engineering'];
    }
  }
  if (!Array.isArray(specialties)) {
    specialties = ['Product Engineering'];
  }

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    r.name || 'User'
  )}&background=${r.user_role === 'admin' ? '0f172a' : 'ff6937'}&color=ffffff&bold=true`;

  return {
    id: r.id,
    name: r.name,
    role: r.role,
    avatar: r.avatar || defaultAvatar,
    email: r.email,
    password: r.password || 'Password@123',
    phone: r.phone || '',
    userRole: (r.user_role as UserSystemRole) || 'specialist',
    status: (r.status as UserStatus) || 'Active',
    department: r.department || 'Digital Engineering',
    specialties,
    region: r.region || 'North America',
    activeLeads: Number(r.active_leads) || 0,
    maxCapacity: Number(r.max_capacity) || 10,
    joinedDate: r.joined_date || '',
  };
}

class PostgresDatabase {
  private pool: Pool;

  constructor() {
    this.pool = getPool();
    this.ensureTables();
  }

  // Idempotently create tables if they do not exist
  public async ensureTables(): Promise<void> {
    if (global.__pgTablesInitialized) return;

    try {
      // 1. Create portal_users table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS portal_users (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) DEFAULT 'Password@123',
          phone VARCHAR(50),
          role VARCHAR(100) NOT NULL,
          user_role VARCHAR(50) DEFAULT 'specialist',
          status VARCHAR(50) DEFAULT 'Active',
          department VARCHAR(100),
          specialties JSONB DEFAULT '[]'::jsonb,
          region VARCHAR(100) DEFAULT 'North America',
          active_leads INT DEFAULT 0,
          max_capacity INT DEFAULT 10,
          avatar TEXT,
          joined_date VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Ensure password column exists and is populated with default password
      await this.pool.query(`
        ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT 'Password@123';
        UPDATE portal_users SET password = 'Password@123' WHERE password IS NULL OR password = '';
      `);

      // 2. Create leads table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS leads (
          id VARCHAR(100) PRIMARY KEY,
          customer VARCHAR(255) NOT NULL,
          company VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          status VARCHAR(50) NOT NULL DEFAULT 'NEW',
          manager VARCHAR(255) NOT NULL,
          manager_id VARCHAR(100),
          source VARCHAR(50) NOT NULL DEFAULT 'Website',
          score INT NOT NULL DEFAULT 7,
          created VARCHAR(50) NOT NULL,
          focus_area TEXT,
          message TEXT,
          is_favourite BOOLEAN DEFAULT FALSE,
          is_overdue BOOLEAN DEFAULT FALSE,
          ai_insights JSONB,
          scheduled_call JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Ensure scheduled_call column exists
      await this.pool.query(`
        ALTER TABLE leads ADD COLUMN IF NOT EXISTS scheduled_call JSONB;
      `);

      // 3. Ensure primary Admin exists
      const userCountRes = await this.pool.query('SELECT count(*) FROM portal_users');
      if (parseInt(userCountRes.rows[0].count, 10) === 0) {
        await this.pool.query(`
          INSERT INTO portal_users (
            id, name, email, phone, role, user_role, status, department, specialties, region, active_leads, max_capacity, avatar, joined_date
          ) VALUES (
            'admin',
            'Admin',
            'admin@impigertech.com',
            '+1 (555) 019-2831',
            'Lead Operations Administrator',
            'admin',
            'Active',
            'Operations & Enterprise Architecture',
            '["Digital Transformation", "Cloud & Architecture", "AI Solutions", "Product Engineering"]'::jsonb,
            'Global',
            0,
            100,
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
            'Jan 2024'
          )
        `);
      }

      global.__pgTablesInitialized = true;
    } catch (err) {
      console.warn('PostgreSQL table check error (will retry):', err);
    }
  }

  // Leads queries
  async getLeads(): Promise<Lead[]> {
    await this.ensureTables();
    try {
      const res = await this.pool.query('SELECT * FROM leads ORDER BY created_at DESC');
      return res.rows.map(mapRowToLead);
    } catch (err) {
      console.error('Error in getLeads:', err);
      return [];
    }
  }

  async getLeadById(id: string): Promise<Lead | undefined> {
    await this.ensureTables();
    try {
      const res = await this.pool.query('SELECT * FROM leads WHERE id = $1', [id]);
      if (res.rows.length === 0) return undefined;
      return mapRowToLead(res.rows[0]);
    } catch (err) {
      console.error('Error in getLeadById:', err);
      return undefined;
    }
  }

  async addLead(lead: Lead): Promise<Lead> {
    await this.ensureTables();
    try {
      await this.pool.query(
        `INSERT INTO leads (
          id, customer, company, email, phone, status, manager, manager_id, source, score, created, focus_area, message, is_favourite, is_overdue, ai_insights, scheduled_call
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (id) DO UPDATE SET
          customer = EXCLUDED.customer,
          company = EXCLUDED.company,
          status = EXCLUDED.status,
          manager = EXCLUDED.manager,
          score = EXCLUDED.score,
          scheduled_call = EXCLUDED.scheduled_call,
          updated_at = CURRENT_TIMESTAMP`,
        [
          lead.id,
          lead.customer,
          lead.company,
          lead.email,
          lead.phone || '',
          lead.status,
          lead.manager,
          lead.managerId || null,
          lead.source,
          lead.score,
          lead.created,
          lead.focusArea || '',
          lead.message || '',
          lead.isFavourite || false,
          lead.isOverdue || false,
          JSON.stringify(lead.aiInsights || null),
          JSON.stringify(lead.scheduledCall || null),
        ]
      );

      // Increment active_leads for manager
      await this.pool.query(
        `UPDATE portal_users SET active_leads = LEAST(max_capacity, active_leads + 1) WHERE name = $1`,
        [lead.manager]
      );

      return lead;
    } catch (err) {
      console.error('Error in addLead:', err);
      return lead;
    }
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
    await this.ensureTables();
    try {
      const current = await this.getLeadById(id);
      if (!current) return null;

      const updated: Lead = { ...current, ...updates };

      await this.pool.query(
        `UPDATE leads SET
          customer = $1,
          company = $2,
          email = $3,
          phone = $4,
          status = $5,
          manager = $6,
          source = $7,
          score = $8,
          focus_area = $9,
          message = $10,
          is_favourite = $11,
          is_overdue = $12,
          ai_insights = $13,
          scheduled_call = $14,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $15`,
        [
          updated.customer,
          updated.company,
          updated.email,
          updated.phone || '',
          updated.status,
          updated.manager,
          updated.source,
          updated.score,
          updated.focusArea || '',
          updated.message || '',
          updated.isFavourite || false,
          updated.isOverdue || false,
          JSON.stringify(updated.aiInsights || null),
          JSON.stringify(updated.scheduledCall || null),
          id,
        ]
      );

      // If manager changed, adjust active_leads
      if (updates.manager && updates.manager !== current.manager) {
        await this.pool.query(
          `UPDATE portal_users SET active_leads = GREATEST(0, active_leads - 1) WHERE name = $1`,
          [current.manager]
        );
        await this.pool.query(
          `UPDATE portal_users SET active_leads = LEAST(max_capacity, active_leads + 1) WHERE name = $1`,
          [updates.manager]
        );
      }

      return updated;
    } catch (err) {
      console.error('Error in updateLead:', err);
      return null;
    }
  }

  async deleteLeads(ids: string[]): Promise<boolean> {
    await this.ensureTables();
    if (ids.length === 0) return true;
    try {
      // Decrement counts for affected managers
      const res = await this.pool.query(`SELECT manager FROM leads WHERE id = ANY($1)`, [ids]);
      for (const row of res.rows) {
        await this.pool.query(
          `UPDATE portal_users SET active_leads = GREATEST(0, active_leads - 1) WHERE name = $1`,
          [row.manager]
        );
      }
      await this.pool.query(`DELETE FROM leads WHERE id = ANY($1)`, [ids]);
      return true;
    } catch (err) {
      console.error('Error in deleteLeads:', err);
      return false;
    }
  }

  async clearAll(): Promise<void> {
    await this.ensureTables();
    try {
      await this.pool.query('DELETE FROM leads');
      await this.pool.query('UPDATE portal_users SET active_leads = 0');
    } catch (err) {
      console.error('Error in clearAll:', err);
    }
  }

  // Managers queries
  async getManagers(): Promise<Manager[]> {
    await this.ensureTables();
    try {
      const res = await this.pool.query(
        `SELECT * FROM portal_users ORDER BY (id = 'admin') DESC, name ASC`
      );
      if (res.rows.length === 0) return INITIAL_MANAGERS;
      return res.rows.map(mapRowToManager);
    } catch (err) {
      console.error('Error in getManagers:', err);
      return INITIAL_MANAGERS;
    }
  }

  async addManager(manager: Manager): Promise<Manager> {
    await this.ensureTables();
    try {
      await this.pool.query(
        `INSERT INTO portal_users (
          id, name, email, password, phone, role, user_role, status, department, specialties, region, active_leads, max_capacity, avatar, joined_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          manager.id,
          manager.name,
          manager.email,
          manager.password || 'Password@123',
          manager.phone || '',
          manager.role,
          manager.userRole || 'specialist',
          manager.status || 'Active',
          manager.department || 'Digital Engineering',
          JSON.stringify(manager.specialties || []),
          manager.region || 'North America',
          manager.activeLeads || 0,
          manager.maxCapacity || 10,
          manager.avatar,
          manager.joinedDate || '',
        ]
      );
      return manager;
    } catch (err) {
      console.error('Error in addManager:', err);
      return manager;
    }
  }

  async updateManager(id: string, updates: Partial<Manager>): Promise<Manager | null> {
    await this.ensureTables();
    try {
      if (id === 'admin' && updates.userRole && updates.userRole !== 'admin') {
        updates.userRole = 'admin';
      }

      const res = await this.pool.query('SELECT * FROM portal_users WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      const current = mapRowToManager(res.rows[0]);
      const updated: Manager = { ...current, ...updates };

      await this.pool.query(
        `UPDATE portal_users SET
          name = $1,
          email = $2,
          password = $3,
          phone = $4,
          role = $5,
          user_role = $6,
          status = $7,
          department = $8,
          specialties = $9,
          region = $10,
          max_capacity = $11,
          avatar = $12,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $13`,
        [
          updated.name,
          updated.email,
          updated.password || 'Password@123',
          updated.phone || '',
          updated.role,
          updated.userRole,
          updated.status,
          updated.department,
          JSON.stringify(updated.specialties),
          updated.region,
          updated.maxCapacity,
          updated.avatar,
          id,
        ]
      );

      // If manager name changed, cascade to leads table
      if (updates.name && updates.name !== current.name) {
        await this.pool.query(`UPDATE leads SET manager = $1 WHERE manager = $2`, [
          updates.name,
          current.name,
        ]);
      }

      return updated;
    } catch (err) {
      console.error('Error in updateManager:', err);
      return null;
    }
  }

  async deleteManager(id: string): Promise<boolean> {
    await this.ensureTables();
    if (id === 'admin') return false; // Primary Admin account is protected
    try {
      await this.pool.query('DELETE FROM portal_users WHERE id = $1', [id]);
      return true;
    } catch (err) {
      console.error('Error in deleteManager:', err);
      return false;
    }
  }

  // Dashboard & Lead Statistics
  async getStats(managerName?: string): Promise<LeadStats> {
    await this.ensureTables();
    try {
      let query = 'SELECT id, status, created, created_at, score, ai_insights FROM leads';
      const params: any[] = [];
      if (managerName) {
        query += ' WHERE LOWER(manager) = LOWER($1)';
        params.push(managerName);
      }
      query += ' ORDER BY created_at ASC';
      const res = await this.pool.query(query, params);
      const leads = res.rows;
      const totalCount = leads.length;

      if (totalCount === 0) {
        return {
          newLeads: { count: 0, changePercent: 0, trend: [0, 0, 0, 0, 0, 0, 0] },
          qualifiedLeads: { count: 0, changePercent: 0, trend: [0, 0, 0, 0, 0, 0, 0] },
          avgResponseTime: { value: '0.0h', changePercent: 0, trend: [0, 0, 0, 0, 0, 0, 0] },
          hotLeads: { count: 0, changePercent: 0, trend: [0, 0, 0, 0, 0, 0, 0] },
          totalCount: 0,
        };
      }

      const newLeadsCount = leads.filter((l) => l.status === 'NEW').length;
      const qualifiedCount = leads.filter((l) => l.status === 'QUALIFIED').length;
      const hotCount = leads.filter((l) => l.status === 'HOT').length;

      // Dynamic 7-interval trend calculation
      const now = new Date();
      const timestamps = leads
        .map((l) => new Date(l.created || l.created_at).getTime())
        .filter((t) => !isNaN(t));

      const earliestTime =
        timestamps.length > 0
          ? Math.min(...timestamps)
          : now.getTime() - 7 * 86400000;
      const latestTime = Math.max(now.getTime(), ...timestamps);
      const timeSpan = Math.max(7 * 86400000, latestTime - earliestTime);
      const step = timeSpan / 7;

      const buckets = Array(7)
        .fill(0)
        .map((_, i) => ({
          start: earliestTime + i * step,
          end: earliestTime + (i + 1) * step,
          new: 0,
          qual: 0,
          hot: 0,
          respTimes: [] as number[],
        }));

      leads.forEach((l) => {
        const t = new Date(l.created || l.created_at).getTime();
        let urgency = 'Medium';
        try {
          const insights =
            typeof l.ai_insights === 'string'
              ? JSON.parse(l.ai_insights)
              : l.ai_insights;
          if (insights?.urgency) urgency = insights.urgency;
        } catch {}

        const respTime =
          urgency === 'Critical'
            ? 0.6
            : urgency === 'High'
            ? 1.0
            : urgency === 'Medium'
            ? 1.8
            : 2.5;

        for (let i = 0; i < 7; i++) {
          if (t >= buckets[i].start && (i === 6 || t < buckets[i].end)) {
            if (l.status === 'NEW') buckets[i].new++;
            if (l.status === 'QUALIFIED') buckets[i].qual++;
            if (l.status === 'HOT') buckets[i].hot++;
            buckets[i].respTimes.push(respTime);
            break;
          }
        }
      });

      const newTrend = buckets.map((b) => b.new);
      const qualTrend = buckets.map((b) => b.qual);
      const hotTrend = buckets.map((b) => b.hot);

      // Response time trend: interpolate if 0 leads in bucket
      let lastResp = 1.4;
      const respTrend = buckets.map((b) => {
        if (b.respTimes.length > 0) {
          lastResp = Number(
            (b.respTimes.reduce((a, b) => a + b, 0) / b.respTimes.length).toFixed(1)
          );
        }
        return lastResp;
      });

      // Overall dynamic average response time
      const allRespTimes = leads.map((l) => {
        let urgency = 'Medium';
        try {
          const insights =
            typeof l.ai_insights === 'string'
              ? JSON.parse(l.ai_insights)
              : l.ai_insights;
          if (insights?.urgency) urgency = insights.urgency;
        } catch {}
        return urgency === 'Critical'
          ? 0.6
          : urgency === 'High'
          ? 1.0
          : urgency === 'Medium'
          ? 1.8
          : 2.5;
      });
      const avgRespVal = (
        allRespTimes.reduce((a, b) => a + b, 0) / allRespTimes.length
      ).toFixed(1);

      // Percentage change comparison (recent half vs prior half)
      const calcChange = (arr: number[]) => {
        const prior = arr.slice(0, 3).reduce((a, b) => a + b, 0);
        const recent = arr.slice(4).reduce((a, b) => a + b, 0);
        if (prior === 0 && recent === 0) return 0;
        if (prior === 0) return 100;
        return Math.round(((recent - prior) / prior) * 100);
      };

      const priorResp = respTrend.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      const recentResp = respTrend.slice(4).reduce((a, b) => a + b, 0) / 3;
      const respChange =
        priorResp > 0
          ? Math.round(((recentResp - priorResp) / priorResp) * 100)
          : 0;

      return {
        newLeads: {
          count: newLeadsCount,
          changePercent: calcChange(newTrend),
          trend: newTrend,
        },
        qualifiedLeads: {
          count: qualifiedCount,
          changePercent: calcChange(qualTrend),
          trend: qualTrend,
        },
        avgResponseTime: {
          value: `${avgRespVal}h`,
          changePercent: respChange,
          trend: respTrend,
        },
        hotLeads: {
          count: hotCount,
          changePercent: calcChange(hotTrend),
          trend: hotTrend,
        },
        totalCount,
      };
    } catch (err) {
      console.error('Error in getStats:', err);
      return {
        newLeads: { count: 0, changePercent: 0, trend: [0, 0, 0, 0, 0, 0, 0] },
        qualifiedLeads: { count: 0, changePercent: 0, trend: [0, 0, 0, 0, 0, 0, 0] },
        avgResponseTime: { value: '0.0h', changePercent: 0, trend: [0, 0, 0, 0, 0, 0, 0] },
        hotLeads: { count: 0, changePercent: 0, trend: [0, 0, 0, 0, 0, 0, 0] },
        totalCount: 0,
      };
    }
  }
}

// Reset singleton instance cleanly across hot reloads
declare global {
  // eslint-disable-next-line no-var
  var __leadDbInstance: PostgresDatabase | undefined;
}

export const db: PostgresDatabase =
  global.__leadDbInstance || (global.__leadDbInstance = new PostgresDatabase());
