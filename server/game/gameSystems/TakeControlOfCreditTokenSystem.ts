import type { AbilityContext } from '../core/ability/AbilityContext';
import { GameStateChangeRequired, ZoneName } from '../core/Constants';
import { CardType, EventName } from '../core/Constants';
import type { ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import * as Helpers from '../core/utils/Helpers';
import * as Contract from '../core/utils/Contract';
import * as ChatHelpers from '../core/chat/ChatHelpers';
import type { Player } from '../core/Player';
import type { Card } from '../core/card/Card';

export interface ITakeControlOfCreditTokenProperties extends ICardTargetSystemProperties {
    newController: Player;
}

export class TakeControlOfCreditTokenSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, ITakeControlOfCreditTokenProperties> {
    public override readonly name = 'takeControl';
    public override readonly eventName = EventName.OnTakeControl;
    protected override readonly targetTypeFilter = [CardType.TokenCard];

    public override eventHandler(event, additionalProperties: Partial<ITakeControlOfCreditTokenProperties>): void {
        const card = event.card as Card;
        const newController = event.newController as Player;

        Contract.assertTrue(card.isCreditToken(), 'Card must be a Credit token');

        if (newController === card.controller) {
            return;
        }

        card.takeControl(newController);
    }

    public override getEffectMessage(context: TContext, additionalProperties?: Partial<ITakeControlOfCreditTokenProperties>): [string, any[]] {
        const { target, newController } = this.generatePropertiesFromContext(context, additionalProperties);

        const targetsArray = Helpers.asArray(target);

        Contract.assertNonEmpty(targetsArray, 'At least one target must be provided for the effect message');

        const currentController = targetsArray[0].controller;
        const verb = newController === context.player ? 'take' : 'give';
        const preposition = newController === context.player ? 'from' : 'to';
        const objectOfPreposition = newController === context.player ? currentController : newController;

        return ['{0} control of {1} {2} {3}', [verb, ChatHelpers.pluralize(targetsArray.length, 'a Credit token', 'Credit tokens'), preposition, objectOfPreposition]];
    }

    public override canAffectInternal(
        card: Card,
        context: TContext,
        additionalProperties?: Partial<ITakeControlOfCreditTokenProperties>,
        mustChangeGameState?: GameStateChangeRequired
    ): boolean {
        if (!card.isCreditToken() || card.zoneName !== ZoneName.Base) {
            return false;
        }

        const properties = this.generatePropertiesFromContext(context);

        if (mustChangeGameState !== GameStateChangeRequired.None && properties.newController === card.controller) {
            return false;
        }

        return super.canAffectInternal(card, context);
    }

    public override addPropertiesToEvent(event: any, card: Card, context: TContext, additionalProperties?: Partial<ITakeControlOfCreditTokenProperties>): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        const properties = this.generatePropertiesFromContext(context);

        event.newController = properties.newController;
    }
}