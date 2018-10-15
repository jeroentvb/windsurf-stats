# Windsurf statistics tracking
An easy way to track windsurf statistics.  
This project is a web interface to easily save windsurf session data.
It currently works best for my own use case (gear and spots), but I'm plannig to make it accessible for windsurfers from everywhere.

It currently stores the following values:
1. Spot
2. Sailsize
3. Board
4. Rating
5. Note

Using the spot name, it also scrapes highest average windspeed and gust from windfinder (only works if input is on same day as the windsurf session).

## Things for the future
- [x] Add users
- [ ] Rewrite this readme
- [ ] Fix the missing options (e.g. add a session that is not today)
- [ ] Visualize the data
- [ ] Add preferences (spots, gear e.t.c.)

<!-- create a `.env` file with `SESSION_SECRET=` and a secret word after the = -->
