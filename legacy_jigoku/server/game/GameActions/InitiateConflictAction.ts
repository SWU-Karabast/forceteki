import type { AbilityContext } from '../AbilityContext';
import { ConflictTypes, EventNames } from '../Constants';
import type Player from '../player';
import { ProvinceCard } from '../ProvinceCard';
import { PlayerAction, type PlayerActionProperties } from './PlayerAction';

export interface InitiateConflictProperties extends PlayerActionProperties {
    canPass?: boolean;
    forcedDeclaredType?: ConflictTypes;
    forceProvinceTarget?: ProvinceCard;
}

export class InitiateConflictAction extends PlayerAction<InitiateConflictProperties> {
    name = 'initiateConflict';
    eventName = EventNames.OnConflictInitiated;
    effect = 'declare a new conflict';
    defaultProperties: InitiateConflictProperties = {
        canPass: true
    };

    canAffect(player: Player, context: AbilityContext): boolean {
        const { forcedDeclaredType } = this.getProperties(context);
        return super.canAffect(player, context) && player.hasLegalConflictDeclaration({ forcedDeclaredType });
    }

    defaultTargets(context: AbilityContext): Player[] {
        return [context.player];
    }

    eventHandler(event: any, additionalProperties: any): void {
        const properties = this.getProperties(event.context, additionalProperties);
        event.context.game.initiateConflict(
            event.player,
            properties.canPass,
            properties.forcedDeclaredType,
            properties.forceProvinceTarget
        );
    }
}
