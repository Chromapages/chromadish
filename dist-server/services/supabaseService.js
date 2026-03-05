import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
const hasSupabase = Boolean(supabaseUrl && supabaseKey);
const inMemoryJobs = new Map();
if (!hasSupabase) {
    console.error('Warning: Supabase credentials missing. Falling back to in-memory job storage.');
}
export const supabase = hasSupabase ? createClient(supabaseUrl, supabaseKey) : null;
export const jobDb = {
    async createJob(job) {
        const normalizedJob = {
            ...job,
            created_at: job.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        if (!supabase) {
            inMemoryJobs.set(normalizedJob.id, normalizedJob);
            return normalizedJob;
        }
        const { data, error } = await supabase
            .from('mockup_jobs')
            .insert(normalizedJob)
            .select()
            .single();
        if (error) {
            console.error('Error creating job in Supabase, using in-memory fallback:', error);
            inMemoryJobs.set(normalizedJob.id, normalizedJob);
            return normalizedJob;
        }
        return data;
    },
    async updateJob(id, updates) {
        const now = new Date().toISOString();
        if (!supabase) {
            const existing = inMemoryJobs.get(id);
            if (!existing)
                return null;
            const updated = { ...existing, ...updates, updated_at: now };
            inMemoryJobs.set(id, updated);
            return updated;
        }
        const { data, error } = await supabase
            .from('mockup_jobs')
            .update({ ...updates, updated_at: now })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error(`Error updating job ${id} in Supabase, using in-memory fallback:`, error);
            const existing = inMemoryJobs.get(id);
            if (!existing)
                return null;
            const updated = { ...existing, ...updates, updated_at: now };
            inMemoryJobs.set(id, updated);
            return updated;
        }
        inMemoryJobs.set(id, data);
        return data;
    },
    async getJob(id) {
        if (!supabase) {
            return inMemoryJobs.get(id) || null;
        }
        const { data, error } = await supabase
            .from('mockup_jobs')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            console.error(`Error fetching job ${id} from Supabase, checking in-memory fallback:`, error);
            return inMemoryJobs.get(id) || null;
        }
        inMemoryJobs.set(id, data);
        return data;
    }
};
