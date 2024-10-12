import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, EffectName, Location, WildcardCardType } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';

export interface IMoveCardProperties extends ICardTargetSystemProperties {
    destination?: Location;
    switch?: boolean;
    switchTarget?: Card;
    shuffle?: boolean;
    // TODO: remove completely if faceup logic is not needed
    // faceup?: boolean;
    bottom?: boolean;
    changePlayer?: boolean;
    discardDestinationCards?: boolean;
}

export class MoveCardSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IMoveCardProperties> {
    public override readonly name = 'move';
    public override targetTypeFilter = [WildcardCardType.Unit, WildcardCardType.Upgrade, CardType.Event];

    protected override defaultProperties: IMoveCardProperties = {
        destination: null,
        switch: false,
        switchTarget: null,
        shuffle: false,
        // TODO: remove completely if faceup logic is not needed
        // faceup: false,
        bottom: false,
        changePlayer: false,
    };

    public eventHandler(event: any, additionalProperties = {}): void {
        const context = event.context;
        // TODO: remove this completely if determinmed we don't need card snapshots
        // event.cardStateWhenMoved = card.createSnapshot();
        const properties = this.generatePropertiesFromContext(context, additionalProperties) as IMoveCardProperties;
        // TODO: Is there a better/cleaner way to handle one or multiple cards here?
        const cards = [].concat(properties.target);
        for (const card of cards) {
            if (properties.switch && properties.switchTarget) {
                const otherCard = properties.switchTarget;
                card.owner.moveCard(otherCard, card.location);
            }
            const player = properties.changePlayer && card.controller.opponent ? card.controller.opponent : card.controller;
            player.moveCard(card, properties.destination, { bottom: !!properties.bottom });

            const target = properties.target;
            // if (Array.isArray(target)) {
            //     // TODO: should we allow this to move multiple cards at once?
            //     if (!Contract.assertArraySize(target, 1)) {
            //         return;
            //     }

            //     target = target[0];
            // }

            if (properties.destination === Location.Deck && properties.shuffle) {
                card.owner.shuffleDeck();
            }
            // TODO: remove completely if faceup logic is not needed
            // else if (properties.faceup) { // TODO: add overrides for other card properties (e.g., exhausted)
            //     card.facedown = false;
            // }
        }
    }

    public override getCostMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context) as IMoveCardProperties;
        return ['shuffling {0} into their deck', [properties.target]];
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context) as IMoveCardProperties;
        const destinationController = Array.isArray(properties.target)
            ? properties.changePlayer
                ? properties.target[0].controller.opponent
                : properties.target[0].controller
            : properties.changePlayer
                ? properties.target.controller.opponent
                : properties.target.controller;
        if (properties.shuffle) {
            return ['shuffle {0} into {1}\'s {2}', [properties.target, destinationController, properties.destination]];
        }
        return [
            'move {0} to ' + (properties.bottom ? 'the bottom of ' : '') + '{1}\'s {2}',
            [properties.target, destinationController, properties.destination]
        ];
    }

    public override canAffect(card: Card, context: TContext, additionalProperties = {}): boolean {
        const { changePlayer, destination } = this.generatePropertiesFromContext(context, additionalProperties) as IMoveCardProperties;
        return (
            (!changePlayer ||
              (!card.hasRestriction(EffectName.TakeControl, context) &&
                !card.anotherUniqueInPlay(context.player))) &&
                (!destination || context.player.isLegalLocationForCardType(card.type, destination)) &&
                !EnumHelpers.isArena(card.location) &&
                super.canAffect(card, context)
        );
    }
}