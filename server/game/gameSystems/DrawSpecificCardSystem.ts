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
    public override readonly eventName = EventName.OnCardsDrawn;
    public override readonly effectDescription = 'draw a card';
    public override targetTypeFilter = [WildcardCardType.Unit, WildcardCardType.Upgrade, CardType.Event];

    protected override defaultProperties: IDrawSpecificCardProperties = {
        switch: false,
        switchTarget: null,
        shuffle: false,
        changePlayer: false,
    };

    public eventHandler(event: any, additionalProperties: Partial<IDrawSpecificCardProperties> = {}): void {
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

    public override canAffectInternal(card: Card, context: TContext, additionalProperties: Partial<IDrawSpecificCardProperties> = {}): boolean {
        const { changePlayer } = this.generatePropertiesFromContext(context, additionalProperties) as IDrawSpecificCardProperties;
        return (
            (!changePlayer ||
              (!card.hasRestriction(EffectName.TakeControl, context) &&
                !card.anotherUniqueInPlay(context.player))) &&
                (context.player.isLegalZoneForCardType(card.type, ZoneName.Hand)) &&
                !EnumHelpers.isArena(card.zoneName) &&
                super.canAffectInternal(card, context)
        );
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties: Partial<IDrawSpecificCardProperties> = {}): void {
        const properties = this.generatePropertiesFromContext(context) as IDrawSpecificCardProperties;
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        // add amount and player to have same properties than drawn event from DrawSystem
        event.amount = Array.isArray(properties.target) ? properties.target.length : 1;
        event.player = context.player;
    }
}
