import {createHandler} from './core.js';
Deno.serve(createHandler({
 OPENAI_API_KEY:Deno.env.get('OPENAI_API_KEY'),
 OPENAI_MODEL:Deno.env.get('OPENAI_MODEL'),
 ALLOWED_ORIGINS:Deno.env.get('ALLOWED_ORIGINS'),
 SUPABASE_URL:Deno.env.get('SUPABASE_URL'),
 SUPABASE_SERVICE_ROLE_KEY:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
}));
