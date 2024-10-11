import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, EffectName, Location, RelativePlayer, WildcardCardType } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import { ready } from './GameSystemLibrary';
import * as Contract from '../core/utils/Contract';

export interface IResourceCardProperties extends ICardTargetSystemProperties {
    // TODO: remove completely if faceup logic is not needed
    // faceup?: boolean;
    targetPlayer?: RelativePlayer; // TODO: this might be needed for Arquitens Assault Cruiser
    readyResource?: boolean;
}

export class ResourceCardSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IResourceCardProperties> {
    public override readonly name = 'resource';
    public override targetTypeFilter = [WildcardCardType.Unit, WildcardCardType.Upgrade, CardType.Event];

    protected override defaultProperties: IResourceCardProperties = {
        // TODO: remove completely if faceup logic is not needed
        // faceup: false,
        targetPlayer: RelativePlayer.Self,
        readyResource: false
    };

    public eventHandler(event: any, additionalProperties = {}): void {
        const context = event.context;
        // TODO: remove this completely if determinmed we don't need card snapshots
        // event.cardStateWhenMoved = card.createSnapshot();
        const properties = this.generatePropertiesFromContext(context, additionalProperties) as IResourceCardProperties;
        // TODO: If we ever need to resource multiple cards at once, this will need an update
        const card = Array.isArray(properties.target) ? properties.target[0] as Card : properties.target as Card;

        const player = properties.targetPlayer === RelativePlayer.Opponent ? card.controller.opponent : card.controller;
        player.moveCard(card, Location.Resource);
        if (properties.readyResource) {
            context.game.openEventWindow(ready({ target: card }).generateEvent(context.source, context));

            event.setContingentEventsGenerator((event) => {
                const readyResourceEvent = ready({ target: card }).generateEvent(context.source, context);
                const contingentEvents = [readyResourceEvent];

                return contingentEvents;
            });
        }
    }

    public override getCostMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context) as IResourceCardProperties;
        return ['moving {0} to resources', [properties.target]];
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context) as IResourceCardProperties;
        const card = Array.isArray(properties.target) ? properties.target[0] as Card : properties.target as Card;

        const destinationController = properties.targetPlayer === RelativePlayer.Opponent ? card.controller.opponent : card.controller;
        return [
            'move {0} to {1}\'s resources',
            [properties.target, destinationController]
        ];
    }

    public override canAffect(card: Card, context: TContext, additionalProperties = {}): boolean {
        const { targetPlayer } = this.generatePropertiesFromContext(context, additionalProperties) as IResourceCardProperties;
        return (
            (targetPlayer === RelativePlayer.Self ||
                (!card.hasRestriction(EffectName.TakeControl, context) &&
                    !card.anotherUniqueInPlay(context.player))) &&
            context.player.isLegalLocationForCardType(card.type, Location.Resource) &&
            !EnumHelpers.isArena(card.location) &&
            super.canAffect(card, context)
        );
    }
}