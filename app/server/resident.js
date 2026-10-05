import { proxyTenant, proxyTenantStream, readForm, toQueryString } from './tenant-proxy.js';

// Owner/resident views on the Laravel API's `/tenant/resident/*` group -
// bills and my buildings (+ their contacts/representatives) (read-only), the
// building message board (read, post to own buildings/areas/apartments,
// delete own posts) and public building incidents (read, report, "me too"). Every one of these is filtered server-side to the caller's own
// apartment footprint (GlobalUserApartmentFootprint on the API), so like
// tickets.js these are plain passthroughs. `:id` params are numeric-only so
// nothing but an id can be spliced into the upstream path.
const ID = '(\\d+)';
// Up to 20 message targets (the API's own cap), each building-wide or
// narrowed to one common area or one apartment.
const MESSAGE_TARGET_FIELD = /^targets\[(\d|1\d)\]\[(building_id|building_area_type_id|apartment_id)\]$/;

export function registerResidentRoutes(app) {
  app.get('/api/tenant/resident/property-bills', (req, res) => {
    const { status, building_id, apartment_id, year, page } = req.query;
    const qs = toQueryString({ status, building_id, apartment_id, year, page });
    proxyTenant(req, res, `/api/tenant/resident/property-bills${qs}`);
  });

  app.get(`/api/tenant/resident/property-bills/:id${ID}`, (req, res) => {
    proxyTenant(req, res, `/api/tenant/resident/property-bills/${req.params.id}`);
  });

  app.get(`/api/tenant/resident/property-bills/:id${ID}/file`, (req, res) => {
    proxyTenantStream(req, res, `/api/tenant/resident/property-bills/${req.params.id}/file`);
  });

  app.get('/api/tenant/resident/buildings', (req, res) => {
    proxyTenant(req, res, '/api/tenant/resident/buildings');
  });

  app.get(`/api/tenant/resident/buildings/:id${ID}`, (req, res) => {
    proxyTenant(req, res, `/api/tenant/resident/buildings/${req.params.id}`);
  });

  app.get(`/api/tenant/resident/buildings/:id${ID}/contacts`, (req, res) => {
    proxyTenant(req, res, `/api/tenant/resident/buildings/${req.params.id}/contacts`);
  });

  app.get('/api/tenant/resident/messages', (req, res) => {
    const qs = toQueryString({ building_id: req.query.building_id, page: req.query.page });
    proxyTenant(req, res, `/api/tenant/resident/messages${qs}`);
  });

  app.get(`/api/tenant/resident/messages/:id${ID}`, (req, res) => {
    proxyTenant(req, res, `/api/tenant/resident/messages/${req.params.id}`);
  });

  app.get(`/api/tenant/resident/messages/:id${ID}/download`, (req, res) => {
    proxyTenantStream(req, res, `/api/tenant/resident/messages/${req.params.id}/download`);
  });

  // Multipart (optional attachment); targets use bracket notation. The API
  // re-checks every target against the caller's own footprint.
  app.post('/api/tenant/resident/messages', async (req, res) => {
    const form = await readForm(req, res, {
      fields: ['message_category_id', 'body'],
      fieldPatterns: [MESSAGE_TARGET_FIELD],
      files: ['attachment'],
    });
    if (!form) return;
    proxyTenant(req, res, '/api/tenant/resident/messages', { method: 'POST', body: form });
  });

  // Own posts only (anyone else's answers 404).
  app.delete(`/api/tenant/resident/messages/:id${ID}`, (req, res) => {
    proxyTenant(req, res, `/api/tenant/resident/messages/${req.params.id}`, { method: 'DELETE' });
  });

  app.get('/api/tenant/resident/message-categories', (req, res) => {
    proxyTenant(req, res, '/api/tenant/resident/message-categories');
  });

  // Public building incidents (lift out, insects...). Everyone at the
  // building sees the reduced public shape; the reporter follows up on
  // their own report through the /api/tenant/tickets/:id routes. POST is
  // multipart when a photo is attached; a still-open duplicate comes back
  // as 409 incident_duplicate with details.existing_incident_id.
  app.get('/api/tenant/resident/incidents', (req, res) => {
    const { building_id, incident_type_id, state, page } = req.query;
    const qs = toQueryString({ building_id, incident_type_id, state, page });
    proxyTenant(req, res, `/api/tenant/resident/incidents${qs}`);
  });

  app.post('/api/tenant/resident/incidents', async (req, res) => {
    const form = await readForm(req, res, {
      fields: [
        'building_id',
        'building_area_type_id',
        'incident_type_id',
        'incident_subtype_id',
        'description',
      ],
      files: ['photo'],
    });
    if (!form) return;
    proxyTenant(req, res, '/api/tenant/resident/incidents', { method: 'POST', body: form });
  });

  app.get(`/api/tenant/resident/incidents/:id${ID}`, (req, res) => {
    proxyTenant(req, res, `/api/tenant/resident/incidents/${req.params.id}`);
  });

  // "Me too" on / off.
  app.post(`/api/tenant/resident/incidents/:id${ID}/affected`, (req, res) => {
    proxyTenant(req, res, `/api/tenant/resident/incidents/${req.params.id}/affected`, {
      method: 'POST',
    });
  });

  app.delete(`/api/tenant/resident/incidents/:id${ID}/affected`, (req, res) => {
    proxyTenant(req, res, `/api/tenant/resident/incidents/${req.params.id}/affected`, {
      method: 'DELETE',
    });
  });
}
