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
* Visualize the data

<!-- create a `.env` file with `SESSION_SECRET=` and a secret word after the = -->
