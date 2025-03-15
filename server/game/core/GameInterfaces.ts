import type { GameMode } from '../../GameMode';
import type { Lobby } from '../../gamenode/Lobby';
import type { User } from '../../Settings';
import type { CardDataGetter } from '../../utils/cardData/CardDataGetter';
import type { ClockConfig } from './clocks/ClockSelector';
import * as Contract from './utils/Contract';

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

export function validateGameConfiguration(configuration: GameConfiguration): void {
    Contract.assertNotNullLike(configuration.id);
    Contract.assertNotNullLike(configuration.name);
    Contract.assertNotNullLike(configuration.owner);
    Contract.assertNotNullLike(configuration.players);
    Contract.assertNotNullLike(configuration.gameMode);
    Contract.assertNotNullLike(configuration.cardDataGetter);
}

export interface GameOptions {
    router: Lobby;
}

export function validateGameOptions(options: GameOptions): void {
    Contract.assertNotNullLike(options.router);
}