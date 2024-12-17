import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, EffectName, EventName, WildcardCardType, ZoneName } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { ShuffleDeckSystem } from './ShuffleDeckSystem';

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
    protected override readonly eventName = EventName.OnCardsDrawn;
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
        // TODO: remove this completely if determined we don't need card snapshots
        // event.cardStateWhenMoved = card.createSnapshot();
        const properties = this.generatePropertiesFromContext(context, additionalProperties) as IDrawSpecificCardProperties;
        card.moveTo(ZoneName.Hand);

        const target = properties.target;
        // if (Array.isArray(target)) {
        //     // TODO: should we allow this to move multiple cards at once?
        //     if (!Contract.assertArraySize(target, 1)) {
        //         return;
        //     }

        //     target = target[0];
        // }

        if (properties.shuffle && (Array.isArray(target) && (target.length === 0 || card === target[target.length - 1]))) {
            new ShuffleDeckSystem({}).generateEvent(context);
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
                (context.player.isLegalZoneForCardType(card.type, ZoneName.Hand)) &&
                !EnumHelpers.isArena(card.zoneName) &&
                super.canAffect(card, context)
        );
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties: any = {}): void {
        const properties = this.generatePropertiesFromContext(context) as IDrawSpecificCardProperties;
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        // add amount and player to have same properties than drawn event from DrawSystem
        event.amount = Array.isArray(properties.target) ? properties.target.length : 1;
        event.player = context.player;
    }
}
