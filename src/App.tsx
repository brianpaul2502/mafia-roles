import { useState } from "react";
import "./App.css";

type Role = "Mafia" | "Detective" | "Doctor" | "Civilian";

interface RoleConfig {
  name: Role;
  count: number;
  icon: string;
}

interface Assignment {
  player: string;
  role: Role;
}

const roleInfo: Record<Role, { icon: string; description: string }> = {
  Mafia: {
    icon: "🔴",
    description: "You are Mafia. Eliminate the other players.",
  },
  Detective: {
    icon: "🕵️",
    description: "You are the Detective. Find the Mafia.",
  },
  Doctor: {
    icon: "❤️",
    description: "You are the Doctor. Protect the players.",
  },
  Civilian: {
    icon: "🔵",
    description: "You are a Civilian. Find the Mafia.",
  },
};

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function App() {
  // =========================
  // SAVED PLAYERS
  // =========================

  const [savedPlayers, setSavedPlayers] = useState<string[]>(() => {
    const saved = localStorage.getItem("mafiaPlayers");

    return saved ? JSON.parse(saved) : [];
  });

  // Players selected for the current game
  const [players, setPlayers] = useState<string[]>(() => {
    const saved = localStorage.getItem("mafiaPlayers");

    return saved ? JSON.parse(saved) : [];
  });

  const [playerName, setPlayerName] = useState("");

  const [screen, setScreen] = useState<
    "players" | "roles" | "reveal" | "finished"
  >("players");

  const [roles, setRoles] = useState<RoleConfig[]>([
    { name: "Mafia", count: 1, icon: "🔴" },
    { name: "Detective", count: 1, icon: "🕵️" },
    { name: "Doctor", count: 1, icon: "❤️" },
    { name: "Civilian", count: 0, icon: "🔵" },
  ]);

  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // =========================
  // SAVE PLAYERS
  // =========================

  const savePlayers = (updatedPlayers: string[]) => {
    setSavedPlayers(updatedPlayers);

    localStorage.setItem(
      "mafiaPlayers",
      JSON.stringify(updatedPlayers)
    );
  };

  // =========================
  // ADD PLAYER
  // =========================

  const addPlayer = () => {
    const name = playerName.trim();

    if (!name) return;

    // Prevent duplicate players
    if (savedPlayers.includes(name)) {
      alert("This player is already saved.");
      return;
    }

    const updatedPlayers = [...savedPlayers, name];

    savePlayers(updatedPlayers);

    setPlayers([...players, name]);

    setPlayerName("");
  };

  // =========================
  // SELECT / UNSELECT PLAYER
  // =========================

  const togglePlayer = (name: string) => {
    if (players.includes(name)) {
      setPlayers(players.filter((player) => player !== name));
    } else {
      setPlayers([...players, name]);
    }
  };

  // =========================
  // DELETE SAVED PLAYER
  // =========================

  const deleteSavedPlayer = (name: string) => {
    const updatedPlayers = savedPlayers.filter(
      (player) => player !== name
    );

    savePlayers(updatedPlayers);

    setPlayers(players.filter((player) => player !== name));
  };

  // =========================
  // ROLE COUNT
  // =========================

  const updateRoleCount = (index: number, change: number) => {
    setRoles((currentRoles) =>
      currentRoles.map((role, i) => {
        if (i !== index) return role;

        return {
          ...role,
          count: Math.max(0, role.count + change),
        };
      })
    );
  };

  const totalRoles = roles.reduce(
    (total, role) => total + role.count,
    0
  );

  // =========================
  // ASSIGN ROLES
  // =========================

  const assignRoles = () => {
    const roleList: Role[] = [];

    roles.forEach((role) => {
      for (let i = 0; i < role.count; i++) {
        roleList.push(role.name);
      }
    });

    const shuffledRoles = shuffle(roleList);

    const newAssignments: Assignment[] = players.map(
      (player, index) => ({
        player,
        role: shuffledRoles[index],
      })
    );

    setAssignments(newAssignments);
    setCurrentPlayer(0);
    setRevealed(false);

    setScreen("reveal");
  };

  // =========================
  // NEXT PLAYER
  // =========================

  const nextPlayer = () => {
    if (currentPlayer === assignments.length - 1) {
      setScreen("finished");
      return;
    }

    setCurrentPlayer((current) => current + 1);
    setRevealed(false);
  };

  // =========================
  // NEW GAME
  // =========================

  const newGame = () => {
    setAssignments([]);
    setCurrentPlayer(0);
    setRevealed(false);

    // Keep saved players
    setPlayers([...savedPlayers]);

    setRoles([
      { name: "Mafia", count: 1, icon: "🔴" },
      { name: "Detective", count: 1, icon: "🕵️" },
      { name: "Doctor", count: 1, icon: "❤️" },
      { name: "Civilian", count: 0, icon: "🔵" },
    ]);

    setScreen("roles");
  };

  // =========================
  // REVEAL SCREEN
  // =========================

  if (screen === "reveal") {
    const currentAssignment = assignments[currentPlayer];

    const role = roleInfo[currentAssignment.role];

    return (
      <div className="app">
        <div className="card reveal-card">
          {!revealed ? (
            <>
              <div className="pass-icon">📱</div>

              <p className="pass-label">
                Pass the phone to
              </p>

              <h1>{currentAssignment.player}</h1>

              <p className="warning">
                Make sure nobody else can see the screen.
              </p>

              <button
                className="reveal-button"
                onClick={() => setRevealed(true)}
              >
                👁️ Reveal My Role
              </button>

              <div className="progress">
                Player {currentPlayer + 1} of{" "}
                {assignments.length}
              </div>
            </>
          ) : (
            <>
              <p className="your-role">
                YOUR ROLE
              </p>

              <div className="big-role-icon">
                {role.icon}
              </div>

              <h1>{currentAssignment.role}</h1>

              <p className="role-description">
                {role.description}
              </p>

              <div className="secret-warning">
                🔒 Keep your role secret!
              </div>

              <button
                className="hide-next-button"
                onClick={nextPlayer}
              >
                {currentPlayer === assignments.length - 1
                  ? "🙈 Hide & Finish"
                  : "🙈 Hide & Next Player"}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // =========================
  // FINISHED SCREEN
  // =========================

  if (screen === "finished") {
    return (
      <div className="app">
        <div className="card finished-card">
          <div className="finished-icon">
            🎭
          </div>

          <h1>All Roles Assigned!</h1>

          <p>
            Everyone has seen their role.
            <br />
            You are ready to play Mafia.
          </p>

          <button
            className="continue-button"
            onClick={newGame}
          >
            🔄 Play Again
          </button>

          <button
            className="back-button"
            onClick={() => setScreen("players")}
          >
            ✏️ Change Players
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // ROLE CONFIGURATION
  // =========================

  if (screen === "roles") {
    return (
      <div className="app">
        <div className="card">
          <h1>🎭 Mafia</h1>

          <p className="subtitle">
            Configure Roles
          </p>

          <div className="player-count">
            Players: <strong>{players.length}</strong>
          </div>

          <div className="roles-list">
            {roles.map((role, index) => (
              <div
                className="role-row"
                key={role.name}
              >
                <div className="role-name">
                  <span className="role-icon">
                    {role.icon}
                  </span>

                  <span>{role.name}</span>
                </div>

                <div className="role-controls">
                  <button
                    className="counter-button"
                    onClick={() =>
                      updateRoleCount(index, -1)
                    }
                    disabled={role.count === 0}
                  >
                    −
                  </button>

                  <span className="role-count">
                    {role.count}
                  </span>

                  <button
                    className="counter-button"
                    onClick={() =>
                      updateRoleCount(index, 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div
            className={`role-total ${totalRoles === players.length
              ? "valid"
              : "invalid"
              }`}
          >
            Roles: {totalRoles} / {players.length}

            {totalRoles === players.length
              ? " ✓"
              : " — must equal player count"}
          </div>

          <button
            className="continue-button"
            disabled={
              totalRoles !== players.length
            }
            onClick={assignRoles}
          >
            🔀 Assign Roles
          </button>

          <button
            className="back-button"
            onClick={() =>
              setScreen("players")
            }
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // PLAYER SCREEN
  // =========================

  return (
    <div className="app">
      <div className="card">
        <h1>🎭 Mafia</h1>

        <p className="subtitle">
          Choose Players
        </p>

        <div className="input-row">
          <input
            type="text"
            placeholder="Add new player"
            value={playerName}
            onChange={(e) =>
              setPlayerName(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addPlayer();
              }
            }}
          />

          <button onClick={addPlayer}>
            Add
          </button>
        </div>

        <div className="players-section">
          <h2>
            Saved Players ({savedPlayers.length})
          </h2>

          {savedPlayers.length === 0 ? (
            <p className="empty">
              Add your players to get started.
            </p>
          ) : (
            <div className="player-list">
              {savedPlayers.map((player) => {
                const selected =
                  players.includes(player);

                return (
                  <div
                    className={`player ${selected ? "selected-player" : ""
                      }`}
                    key={player}
                    onClick={() =>
                      togglePlayer(player)
                    }
                  >
                    <span>
                      {selected ? "✓ " : ""}
                      {player}
                    </span>

                    <button
                      className="remove"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteSavedPlayer(player);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="selected-count">
          {players.length} player
          {players.length !== 1 ? "s" : ""} selected
        </div>

        <button
          className="continue-button"
          disabled={players.length < 3}
          onClick={() =>
            setScreen("roles")
          }
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default App;