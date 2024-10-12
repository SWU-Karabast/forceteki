import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, EffectName, Location, WildcardCardType } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';

export interface IDrawSpecificCardProperties extends ICardTargetSystemProperties {
    switch?: boolean;
    switchTarget?: Card;
    shuffle?: boolean;
    // TODO: remove completely if faceup logic is not needed
    // faceup?: boolean;
    changePlayer?: boolean;
}

export class DrawSpecificCardSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IDrawSpecificCardProperties> {
    public override readonly name = 'drawSpecific';
    public override targetTypeFilter = [WildcardCardType.Unit, WildcardCardType.Upgrade, CardType.Event];

    protected override defaultProperties: IDrawSpecificCardProperties = {
        switch: false,
        switchTarget: null,
        shuffle: false,
        changePlayer: false,
    };

    public eventHandler(event: any, additionalProperties = {}): void {
        const context = event.context;
        const card = event.card;
        // TODO: remove this completely if determinmed we don't need card snapshots
        // event.cardStateWhenMoved = card.createSnapshot();
        const properties = this.generatePropertiesFromContext(context, additionalProperties) as IDrawSpecificCardProperties;
        if (properties.switch && properties.switchTarget) {
            const otherCard = properties.switchTarget;
            card.owner.moveCard(otherCard, card.location);
        }
        const player = properties.changePlayer && card.controller.opponent ? card.controller.opponent : card.controller;
        player.moveCard(card, Location.Hand);

        const target = properties.target;
        // if (Array.isArray(target)) {
        //     // TODO: should we allow this to move multiple cards at once?
        //     if (!Contract.assertArraySize(target, 1)) {
        //         return;
        //     }

        //     target = target[0];
        // }

        if (properties.shuffle && (Array.isArray(target) && (target.length === 0 || card === target[target.length - 1]))) {
            card.owner.shuffleDeck();
        }
    }

    public override getCostMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context) as IDrawSpecificCardProperties;
        return ['shuffling {0} into their deck', [properties.target]];
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context) as IDrawSpecificCardProperties;
        const destinationController = Array.isArray(properties.target)
            ? properties.changePlayer
                ? properties.target[0].controller.opponent
                : properties.target[0].controller
            : properties.changePlayer
                ? properties.target.controller.opponent
                : properties.target.controller;
        if (properties.shuffle) {
            return ['shuffle {0} into {1}\'s hand', [properties.target, destinationController]];
        }
        return [
            'move {0} to {1}\'s hand',
            [properties.target, destinationController]
        ];
    }

    public override canAffect(card: Card, context: TContext, additionalProperties = {}): boolean {
        const { changePlayer } = this.generatePropertiesFromContext(context, additionalProperties) as IDrawSpecificCardProperties;
        return (
            (!changePlayer ||
              (!card.hasRestriction(EffectName.TakeControl, context) &&
                !card.anotherUniqueInPlay(context.player))) &&
                (context.player.isLegalLocationForCardType(card.type, Location.Hand)) &&
                !EnumHelpers.isArena(card.location) &&
                super.canAffect(card, context)
        );
    }
}
