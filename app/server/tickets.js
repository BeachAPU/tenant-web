import { proxyTenant, toQueryString } from './tenant-proxy.js';

// Tenant building/apartment maintenance tickets ("Issues" in the UI) -
// distinct from the central SaaS support-ticket system. Visibility for an
// owner/resident (account_type='contact') caller is enforced entirely
// server-side by Ticket's TicketContactVisibilityScope: their own reports,
// tickets on an apartment they own/reside in, and building-wide tickets
// (apartment_id null) for a building they have any apartment in. These
// routes are plain passthroughs - no client-side visibility filtering
// needed or attempted here.
export function registerTicketRoutes(app) {
  app.get('/api/tenant/tickets', (req, res) => {
    const { status, category, priority, building_id, apartment_id, page } = req.query;
    const qs = toQueryString({ status, category, priority, building_id, apartment_id, page });
    proxyTenant(req, res, `/api/tenant/tickets${qs}`);
  });

  app.post('/api/tenant/tickets', (req, res) => {
    const { building_id, apartment_id, title, description, category, priority } = req.body ?? {};
    proxyTenant(req, res, '/api/tenant/tickets', {
      method: 'POST',
      body: { building_id, apartment_id, title, description, category, priority },
    });
  });

  app.get('/api/tenant/tickets/:id', (req, res) => {
    proxyTenant(req, res, `/api/tenant/tickets/${req.params.id}`);
  });

  // Only `status` is ever sent by this app's UI (the narrow confirm-close/
  // reopen action - see IssueCloseReopenActions) even though the field
  // list below mirrors what UpdateTicketRequest actually accepts.
  app.patch('/api/tenant/tickets/:id', (req, res) => {
    const { status, title, description, category, priority } = req.body ?? {};
    proxyTenant(req, res, `/api/tenant/tickets/${req.params.id}`, {
      method: 'PATCH',
      body: { status, title, description, category, priority },
    });
  });

  app.get('/api/tenant/tickets/:id/status-history', (req, res) => {
    proxyTenant(req, res, `/api/tenant/tickets/${req.params.id}/status-history`);
  });

  app.get('/api/tenant/tickets/:id/notes', (req, res) => {
    proxyTenant(req, res, `/api/tenant/tickets/${req.params.id}/notes`);
  });

  app.post('/api/tenant/tickets/:id/notes', (req, res) => {
    proxyTenant(req, res, `/api/tenant/tickets/${req.params.id}/notes`, {
      method: 'POST',
      body: { body: req.body?.body },
    });
  });

  // Single bundle endpoint for every ticket dropdown (categories/statuses/
  // priorities/sources) - per-tenant admin-configurable, never hardcode
  // these values on the frontend.
  app.get('/api/tenant/ticket-options', (req, res) => {
    proxyTenant(req, res, '/api/tenant/ticket-options');
  });

  // Building/apartment picker for ticket creation. Tenant-wide, not scoped
  // to the caller's own footprint (no such endpoint exists on the API yet)
  // - safe to expose because StoreTicketRequest is the real security
  // boundary and rejects an out-of-footprint pick server-side regardless
  // of what this picker showed.
  app.get('/api/tenant/buildings', (req, res) => {
    const qs = toQueryString({ q: req.query.q, page: req.query.page });
    proxyTenant(req, res, `/api/tenant/buildings${qs}`);
  });

  app.get('/api/tenant/buildings/:buildingId/apartments', (req, res) => {
    const qs = toQueryString({ q: req.query.q, page: req.query.page });
    proxyTenant(req, res, `/api/tenant/buildings/${req.params.buildingId}/apartments${qs}`);
  });
}
