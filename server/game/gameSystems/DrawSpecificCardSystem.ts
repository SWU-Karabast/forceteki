import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import { GameStateChangeRequired } from '../core/Constants';
import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, EffectName, EventName, WildcardCardType, ZoneName } from '../core/Constants';
import { EnumHelpers } from '../core/utils/EnumHelpers';
import { ChatHelpers } from '../core/chat/ChatHelpers';
import { Helpers } from '../core/utils/Helpers';
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
    public override targetTypeFilter = [WildcardCardType.Unit, WildcardCardType.Upgrade, CardType.Event];

    protected override defaultProperties: IGameSystemInput<IDrawSpecificCardProperties> = {
        switch: false,
        switchTarget: null,
        shuffle: false,
        changePlayer: false,
    };

    protected override getEffectMessageInternal(context: TContext, properties: IDrawSpecificCardProperties): [string, any[]] {
        const targetsArray = Helpers.asArray(properties.target);

        return [
            'draw {0}',
            [ChatHelpers.pluralize(targetsArray.length, 'a card', 'cards')]
        ];
    }

    protected override eventHandlerInternal(event: any, properties: IDrawSpecificCardProperties): void {
        const context = event.context;
        const card = event.card;
        // TODO: remove this completely if determined we don't need card snapshots
        // event.cardStateWhenMoved = card.createSnapshot();

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

    protected override canAffectInternal(card: Card, context: TContext, properties: IDrawSpecificCardProperties): boolean {
        const { changePlayer } = properties;
        return (
            (!changePlayer ||
              (!card.hasRestriction(EffectName.TakeControl, context) &&
                !card.anotherUniqueInPlay(context.player))) &&
                (context.player.isLegalZoneForCardType(card.type, ZoneName.Hand)) &&
                !EnumHelpers.isArena(card.zoneName) &&
                super.canAffectInternal(card, context, properties, GameStateChangeRequired.None)
        );
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, properties: IDrawSpecificCardProperties): void {
        super.addPropertiesToEvent(event, card, context, properties);
        // add amount and player to have same properties than drawn event from DrawSystem
        event.amount = Array.isArray(properties.target) ? properties.target.length : 1;
        event.player = context.player;
    }
}
