import { Router } from 'express';
import { db } from '../db.js';

export const eventsRouter = Router();

/**
 * GET /api/events
 * Returns list of ward gatherings and RSVP status
 */
eventsRouter.get('/', (req, res) => {
  try {
    const events = db.prepare('SELECT * FROM events ORDER BY id ASC').all();
    const rsvps = db.prepare(`
      SELECT eventId FROM event_rsvps WHERE playerId = 'althea'
    `).all().map(r => r.eventId);

    const annotated = events.map(ev => ({
      ...ev,
      isRsvped: rsvps.includes(ev.id)
    }));

    res.json(annotated);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to retrieve events' });
  }
});

/**
 * POST /api/events/:id/rsvp
 * Register / RSVP for an arcane event
 */
eventsRouter.post('/:id/rsvp', (req, res) => {
  try {
    const { id } = req.params;
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    db.prepare(`
      INSERT OR IGNORE INTO event_rsvps (playerId, eventId)
      VALUES ('althea', ?)
    `).run(id);

    res.json({
      success: true,
      eventId: id,
      message: `RSVP confirmed for ${event.title}! Coordinates locked in telemetry.`
    });
  } catch (err) {
    console.error('Error RSVPing to event:', err);
    res.status(500).json({ error: 'Failed to RSVP for event' });
  }
});
