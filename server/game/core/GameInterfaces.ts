import type { GameMode } from '../../GameMode';
import type { Lobby } from '../../gamenode/Lobby';
import type { IUser } from '../../Settings';
import type { CardDataGetter } from '../../utils/cardData/CardDataGetter';
import * as Contract from './utils/Contract';

export interface GameConfiguration {
    id: string;
    name: string;
    owner: string;
    players: IUser[];
    spectators?: IUser[];
    allowSpectators: boolean;
    gameMode: GameMode;
    cardDataGetter: CardDataGetter;
    useActionTimer?: boolean;
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