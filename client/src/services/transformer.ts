import { Session } from '../../../shared/interfaces/Session'

// Todo: make this better
function session (session: { [key: string]: any }): Session {
  return {
    _id: session._id,
    date: session.date,
    time: {
      start: session.time.start,
      end: session.time.end
    },
    spot: session.spot,
    gear: {
      sail: session.gear.sail,
      board: session.gear.board
    },
    conditions: {
      windspeed: session.conditions.windspeed,
      windgust: session.conditions.windgust,
      winddirection: session.conditions.winddirection,
      temperature: session.conditions.temperature
    },
    rating: session.rating,
    note: session.note
  }
}

export default {
  session
}
