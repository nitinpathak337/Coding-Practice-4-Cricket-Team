const express = require("express");
const sqlite3 = require("sqlite3");
const path = require("path");
const { open } = require("sqlite");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
const dbInitialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running");
    });
  } catch (error) {
    console.log(`Db Error:${error.message}`);
    process.exit(1);
  }
};
dbInitialize();

const convertSnakeToCamel = (obj) => {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
    jerseyNumber: obj.jersey_number,
    role: obj.role,
  };
};

//List of players API

app.get("/players/", async (request, response) => {
  const listOfPlayersQuery = `
    select * from cricket_team`;
  const listOfPlayers = await db.all(listOfPlayersQuery);
  newList = [];
  for (let i of listOfPlayers) {
    let item = convertSnakeToCamel(i);
    newList.push(item);
  }
  response.send(newList);
});

//Player add API

app.post("/players/", async (request, response) => {
  const playerData = request.body;

  const { playerName, jerseyNumber, role } = playerData;

  const playerAddQuery = `
      Insert into
      cricket_team(player_name,jersey_number,role)
      values('${playerName}',${jerseyNumber},'${role}')`;
  await db.run(playerAddQuery);
  response.send("Player Added to Team");
});

//Get Player API

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
    select * from 
    cricket_team where
    player_id=${playerId}`;
  const player = await db.get(playerQuery);
  const playerNewCase = await convertSnakeToCamel(player);
  response.send(playerNewCase);
});

//Update Player API
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateQuery = `
    Update cricket_team
    set player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}'
    where player_id=${playerId}`;
  const updatePlayer = await db.run(updateQuery);
  response.send("Player Details Updated");
});

//Delete Player API

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    delete from
    cricket_team
    where player_id=${playerId};`;
  const deletePlayer = await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
