import { AbilityContext } from '../AbilityContext';
import { Players } from '../Constants';
import { PutIntoPlayAction, PutIntoPlayProperties } from './PutIntoPlayAction';

export interface OpponentPutIntoPlayProperties extends PutIntoPlayProperties {}

export class OpponentPutIntoPlayAction extends PutIntoPlayAction {
    defaultProperties: PutIntoPlayProperties = {
        fate: 0,
        status: 'ordinary',
        controller: Players.Opponent,
        side: null
    };

    getDefaultSide(context: AbilityContext) {
        return context.player.opponent;
    }

    constructor(
        properties: ((context: AbilityContext) => PutIntoPlayProperties) | PutIntoPlayProperties,
        intoConflict = true
    ) {
        super(properties, intoConflict);
    }

    getPutIntoPlayPlayer(context) {
        return context.player.opponent;
    }
}
