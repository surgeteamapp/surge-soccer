import { PlayerPosition, PlayerRole } from '@/components/playbooks/canvas/WheelchairPlayerMarker';
import { BallPosition } from '@/components/playbooks/canvas/BallMarker';

export interface FormationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'OFFENSIVE' | 'DEFENSIVE' | 'SET_PIECE';
  positions: PlayerPosition[];
  ballPosition?: BallPosition;
}

// Role mapping based on jersey number
const roleFromNumber = (num: number): PlayerRole => {
  const roles: PlayerRole[] = ['G', 'S', 'W', 'C'];
  return roles[(num - 1) % 4];
};

// Helper to create team positions
const createTeamPosition = (
  id: string,
  x: number,
  y: number,
  jerseyNumber: number,
  rotation: number = 0
): PlayerPosition => ({
  id,
  x,
  y,
  jerseyNumber,
  role: roleFromNumber(jerseyNumber),
  displayMode: 'letter',
  isOpponent: false,
  rotation,
  hasBall: false,
});

// Helper to create opponent positions
const createOpponentPosition = (
  id: string,
  x: number,
  y: number,
  jerseyNumber: number,
  rotation: number = 180
): PlayerPosition => ({
  id,
  x,
  y,
  jerseyNumber,
  role: roleFromNumber(jerseyNumber),
  displayMode: 'letter',
  isOpponent: true,
  rotation,
  hasBall: false,
});

// Canvas dimensions for reference (power soccer field)
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 500;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2;

export const FORMATION_TEMPLATES: FormationTemplate[] = [
  // OFFENSIVE FORMATIONS
  {
    id: '2-1-1-offense',
    name: '2-1-1 Formation',
    description: 'Two defenders, one midfielder, one striker',
    category: 'OFFENSIVE',
    positions: [
      createTeamPosition('p1', 120, 180, 1, 0),   // Goalkeeper
      createTeamPosition('p2', 250, 150, 2, 0),   // Defender
      createTeamPosition('p3', 250, 310, 3, 0),   // Defender
      createTeamPosition('p4', 450, 230, 4, 0),   // Striker
    ],
    ballPosition: { x: 100, y: 230 },
  },
  {
    id: '1-2-1-offense',
    name: '1-2-1 Diamond',
    description: 'Diamond formation with midfield control',
    category: 'OFFENSIVE',
    positions: [
      createTeamPosition('p1', 120, 230, 1, 0),   // Goalkeeper
      createTeamPosition('p2', 300, 140, 2, 30),  // Left mid
      createTeamPosition('p3', 300, 320, 3, -30), // Right mid
      createTeamPosition('p4', 480, 230, 4, 0),   // Striker
    ],
    ballPosition: { x: 100, y: 230 },
  },
  {
    id: '3-1-attack',
    name: '3-1 Attack',
    description: 'Three players forward, keeper stays back',
    category: 'OFFENSIVE',
    positions: [
      createTeamPosition('p1', 120, 230, 1, 0),   // Goalkeeper
      createTeamPosition('p2', 400, 120, 2, 30),  // Left wing
      createTeamPosition('p3', 400, 340, 3, -30), // Right wing
      createTeamPosition('p4', 550, 230, 4, 0),   // Center forward
    ],
    ballPosition: { x: 530, y: 230 },
  },
  {
    id: 'box-formation',
    name: 'Box Formation',
    description: 'Square formation for ball control',
    category: 'OFFENSIVE',
    positions: [
      createTeamPosition('p1', 180, 150, 1, 0),
      createTeamPosition('p2', 180, 310, 2, 0),
      createTeamPosition('p3', 380, 150, 3, 0),
      createTeamPosition('p4', 380, 310, 4, 0),
    ],
    ballPosition: { x: 280, y: 230 },
  },
  {
    id: 'overload-left',
    name: 'Overload Left',
    description: 'Stack players on the left side to create space',
    category: 'OFFENSIVE',
    positions: [
      createTeamPosition('p1', 120, 230, 1, 0),   // Goalkeeper
      createTeamPosition('p2', 350, 100, 2, 45),  // Left wing
      createTeamPosition('p3', 350, 200, 3, 30),  // Left mid
      createTeamPosition('p4', 500, 150, 4, 0),   // Striker
    ],
    ballPosition: { x: 330, y: 150 },
  },

  // DEFENSIVE FORMATIONS
  {
    id: 'zone-defense',
    name: 'Zone Defense',
    description: 'Protect the goal area with zone coverage',
    category: 'DEFENSIVE',
    positions: [
      createTeamPosition('p1', 750, 230, 1, 180), // Goalkeeper in goal
      createTeamPosition('p2', 620, 140, 2, 180), // Left defender
      createTeamPosition('p3', 620, 320, 3, 180), // Right defender
      createTeamPosition('p4', 500, 230, 4, 180), // Sweeper
    ],
  },
  {
    id: 'man-marking',
    name: 'Man-to-Man Marking',
    description: 'Each outfield player marks an opponent',
    category: 'DEFENSIVE',
    positions: [
      createTeamPosition('p1', 780, 230, 1, 180), // Goalkeeper
      createTeamPosition('p2', 450, 140, 2, 180), // Marker 1
      createTeamPosition('p3', 450, 320, 3, 180), // Marker 2
      createTeamPosition('p4', 550, 230, 4, 180), // Marker 3
      createOpponentPosition('o1', 400, 140, 1),
      createOpponentPosition('o2', 400, 320, 2),
      createOpponentPosition('o3', 500, 230, 3),
      createOpponentPosition('o4', 300, 230, 4),
    ],
  },
  {
    id: 'high-press',
    name: 'High Press',
    description: 'Aggressive pressing high up the field',
    category: 'DEFENSIVE',
    positions: [
      createTeamPosition('p1', 700, 230, 1, 180), // Goalkeeper
      createTeamPosition('p2', 350, 150, 2, 180), // Left presser
      createTeamPosition('p3', 350, 310, 3, 180), // Right presser
      createTeamPosition('p4', 450, 230, 4, 180), // Central presser
    ],
  },
  {
    id: 'low-block',
    name: 'Low Block',
    description: 'Compact defensive shape near own goal',
    category: 'DEFENSIVE',
    positions: [
      createTeamPosition('p1', 800, 230, 1, 180), // Goalkeeper on line
      createTeamPosition('p2', 680, 140, 2, 180), // Left defender
      createTeamPosition('p3', 680, 320, 3, 180), // Right defender
      createTeamPosition('p4', 680, 230, 4, 180), // Central defender
    ],
  },

  // SET PIECES
  {
    id: 'kickoff-offense',
    name: 'Kickoff (Attacking)',
    description: 'Standard kickoff formation',
    category: 'SET_PIECE',
    positions: [
      createTeamPosition('p1', 120, 230, 1, 0),   // Goalkeeper
      createTeamPosition('p2', 380, 180, 2, 0),   // Support
      createTeamPosition('p3', 380, 280, 3, 0),   // Support
      createTeamPosition('p4', 430, 230, 4, 0),   // Kicker
    ],
    ballPosition: { x: CENTER_X - 12, y: CENTER_Y - 12 },
  },
  {
    id: 'goal-kick',
    name: 'Goal Kick',
    description: 'Restart from goal kick',
    category: 'SET_PIECE',
    positions: [
      createTeamPosition('p1', 100, 230, 1, 0),   // Goalkeeper (kicking)
      createTeamPosition('p2', 250, 150, 2, 0),   // Option 1
      createTeamPosition('p3', 250, 310, 3, 0),   // Option 2
      createTeamPosition('p4', 400, 230, 4, 0),   // Long option
    ],
    ballPosition: { x: 80, y: 230 },
  },
  {
    id: 'corner-attack',
    name: 'Corner Kick Attack',
    description: 'Attacking corner kick setup',
    category: 'SET_PIECE',
    positions: [
      createTeamPosition('p1', 200, 230, 1, 0),   // Goalkeeper (stays back)
      createTeamPosition('p2', 700, 180, 2, 0),   // Near post
      createTeamPosition('p3', 700, 280, 3, 0),   // Far post
      createTeamPosition('p4', 850, 50, 4, -45),  // Corner taker
    ],
    ballPosition: { x: 870, y: 30 },
  },
  {
    id: 'penalty-kick',
    name: 'Penalty Kick',
    description: 'Penalty kick setup',
    category: 'SET_PIECE',
    positions: [
      createTeamPosition('p1', 200, 230, 1, 0),   // Own keeper
      createTeamPosition('p2', 600, 150, 2, 0),   // Rebound left
      createTeamPosition('p3', 600, 310, 3, 0),   // Rebound right
      createTeamPosition('p4', 720, 230, 4, 0),   // Penalty taker
    ],
    ballPosition: { x: 700, y: 230 },
  },
];

// Get templates by category
export const getTemplatesByCategory = (category: 'OFFENSIVE' | 'DEFENSIVE' | 'SET_PIECE') => {
  return FORMATION_TEMPLATES.filter(t => t.category === category);
};

// Get a template by ID
export const getTemplateById = (id: string) => {
  return FORMATION_TEMPLATES.find(t => t.id === id);
};
