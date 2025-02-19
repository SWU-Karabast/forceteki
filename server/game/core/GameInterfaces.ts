import type { GameMode } from '../../GameMode';
import type { Lobby } from '../../gamenode/Lobby';
import type { User } from '../../Settings';
import type { CardDataGetter } from '../../utils/cardData/CardDataGetter';
import type { ClockConfig } from './clocks/ClockSelector';

export interface GameConfiguration {
    id: string;
    name: string;
    owner: string;
    players: User[];
    spectators?: User[];
    allowSpectators: boolean;
    gameMode: GameMode;
    cardDataGetter: CardDataGetter;
    clock?: ClockConfig;
}

export interface GameOptions {
    router: Lobby;
}
