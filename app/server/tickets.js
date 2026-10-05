import { proxyTenant, proxyTenantStream, readForm, toQueryString } from './tenant-proxy.js';

// Tenant building/apartment maintenance tickets ("Issues" in the UI) -
// distinct from the central SaaS support-ticket system. Visibility for an
// owner/resident (account_type='contact') caller is enforced entirely
// server-side by Ticket's TicketContactVisibilityScope: their own reports
// (private tickets and incidents) and private tickets on an apartment they
// own/reside in. Public building incidents everyone sees go through
// resident.js instead. These routes are plain passthroughs - no client-side
// visibility filtering needed or attempted here. `:id` params are
// numeric-only so nothing but an id can be spliced into the upstream path.
const ID = '(\\d+)';

export function registerTicketRoutes(app) {
  app.get('/api/tenant/tickets', (req, res) => {
    const { kind, status, category, priority, building_id, apartment_id, page } = req.query;
    const qs = toQueryString({ kind, status, category, priority, building_id, apartment_id, page });
    proxyTenant(req, res, `/api/tenant/tickets${qs}`);
  });

  app.post('/api/tenant/tickets', (req, res) => {
    const { building_id, apartment_id, title, description, category, priority } = req.body ?? {};
    proxyTenant(req, res, '/api/tenant/tickets', {
      method: 'POST',
      body: { building_id, apartment_id, title, description, category, priority },
    });
  });

  app.get(`/api/tenant/tickets/:id${ID}`, (req, res) => {
    proxyTenant(req, res, `/api/tenant/tickets/${req.params.id}`);
  });

  // No PATCH: an owner/resident may not edit any ticket field (the API
  // answers 422). They close or reopen their own report through the
  // reporter-only workflow steps below, and only while staff have marked it
  // resolved (stage awaiting_confirmation).
  app.post(`/api/tenant/tickets/:id${ID}/confirm`, (req, res) => {
    proxyTenant(req, res, `/api/tenant/tickets/${req.params.id}/confirm`, { method: 'POST' });
  });

  app.post(`/api/tenant/tickets/:id${ID}/reopen`, (req, res) => {
    proxyTenant(req, res, `/api/tenant/tickets/${req.params.id}/reopen`, { method: 'POST' });
  });

  // The photo attached to a report - reporter and staff only.
  app.get(`/api/tenant/tickets/:id${ID}/photo`, (req, res) => {
    proxyTenantStream(req, res, `/api/tenant/tickets/${req.params.id}/photo`);
  });

  app.get(`/api/tenant/tickets/:id${ID}/status-history`, (req, res) => {
    proxyTenant(req, res, `/api/tenant/tickets/${req.params.id}/status-history`);
  });

  app.get(`/api/tenant/tickets/:id${ID}/notes`, (req, res) => {
    proxyTenant(req, res, `/api/tenant/tickets/${req.params.id}/notes`);
  });

  // Multipart when a photo is attached. `is_public` is never forwarded -
  // public updates are staff-only.
  app.post(`/api/tenant/tickets/:id${ID}/notes`, async (req, res) => {
    const form = await readForm(req, res, { fields: ['body'], files: ['attachment'] });
    if (!form) return;
    proxyTenant(req, res, `/api/tenant/tickets/${req.params.id}/notes`, {
      method: 'POST',
      body: form,
    });
  });

  app.get(`/api/tenant/tickets/:id${ID}/notes/:noteId${ID}/attachment`, (req, res) => {
    proxyTenantStream(
      req,
      res,
      `/api/tenant/tickets/${req.params.id}/notes/${req.params.noteId}/attachment`,
    );
  });

  // Single bundle endpoint for every ticket dropdown (categories/statuses/
  // priorities/sources/incident_types) - per-tenant admin-configurable,
  // never hardcode these values on the frontend.
  app.get('/api/tenant/ticket-options', (req, res) => {
    proxyTenant(req, res, '/api/tenant/ticket-options');
  });

  // My own in-app notification feed (today: "your report / an incident
  // affecting you was resolved"). Ids are UUIDs.
  app.get('/api/tenant/notifications', (req, res) => {
    proxyTenant(req, res, `/api/tenant/notifications${toQueryString({ page: req.query.page })}`);
  });

  app.patch('/api/tenant/notifications/:id([0-9a-f-]{36})/read', (req, res) => {
    proxyTenant(req, res, `/api/tenant/notifications/${req.params.id}/read`, { method: 'PATCH' });
  });
}
