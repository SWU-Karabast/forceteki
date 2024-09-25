import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, EffectName, Location, WildcardCardType } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';

export interface IResourceCardProperties extends ICardTargetSystemProperties {
    // TODO: remove completely if faceup logic is not needed
    // faceup?: boolean;
    changePlayer?: boolean; // TODO: this might be needed for Arquitens Assault Cruiser
}

export class ResourceCardSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IResourceCardProperties> {
    public override readonly name = 'resource';
    public override targetTypeFilter = [WildcardCardType.Unit, WildcardCardType.Upgrade, CardType.Event];

    protected override defaultProperties: IResourceCardProperties = {
        // TODO: remove completely if faceup logic is not needed
        // faceup: false,
        changePlayer: false,
    };

    public eventHandler(event: any, additionalProperties = {}): void {
        const context = event.context;
        // TODO: remove this completely if determinmed we don't need card snapshots
        // event.cardStateWhenMoved = card.createSnapshot();
        const properties = this.generatePropertiesFromContext(context, additionalProperties) as IResourceCardProperties;
        //TODO: Is there a better/cleaner way to handle one or multiple cards here?
        const cards = [].concat(properties.target);
        cards.forEach((card) => {
            const player = properties.changePlayer && card.controller.opponent ? card.controller.opponent : card.controller;
            player.moveCard(card, Location.Resource);
        });
    }

    public override getCostMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context) as IResourceCardProperties;
        return ['shuffling {0} into their deck', [properties.target]];
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context) as IResourceCardProperties;
        const destinationController = Array.isArray(properties.target)
            ? properties.changePlayer
                ? properties.target[0].controller.opponent
                : properties.target[0].controller
            : properties.changePlayer
                ? properties.target.controller.opponent
                : properties.target.controller;
        return [
            'move {0} to {1}\'s resources',
            [properties.target, destinationController]
        ];
    }

    public override canAffect(card: Card, context: TContext, additionalProperties = {}): boolean {
        const { changePlayer } = this.generatePropertiesFromContext(context, additionalProperties) as IResourceCardProperties;
        return (
            (!changePlayer ||
                (!card.hasRestriction(EffectName.TakeControl, context) &&
                    !card.anotherUniqueInPlay(context.player))) &&
            context.player.isLegalLocationForCardType(card.type, Location.Resource) &&
            !EnumHelpers.isArena(card.location) &&
            super.canAffect(card, context)
        );
    }
}