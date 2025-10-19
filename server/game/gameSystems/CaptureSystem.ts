import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { GameStateChangeRequired, ZoneName, WildcardCardType, EventName, AbilityRestriction } from '../core/Constants';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';
import type { ICaptorCard } from '../core/zone/CaptureZone';

export interface ICaptureProperties extends ICardTargetSystemProperties {

    /** Defaults to context.source, if used in an event must be provided explicitly */
    captor?: ICaptorCard;
}

/**
 * Used for taking control of a unit in the arena
 */
export class CaptureSystem<TContext extends AbilityContext = AbilityContext, TProperties extends ICaptureProperties = ICaptureProperties> extends CardTargetSystem<TContext, TProperties> {
    public override readonly name = 'capture';
    public override readonly eventName = EventName.OnCardCaptured;
    public override readonly effectDescription = 'capture {0}';
    protected override readonly targetTypeFilter = [WildcardCardType.NonLeaderUnit];

    public eventHandler(event): void {
        this.leavesPlayEventHandler(event.card, ZoneName.Capture, event.context, () => event.card.moveToCaptureZone(event.captor.captureZone));
    }

    public override canAffectInternal(card: Card, context: TContext, _additionalProperties: Partial<TProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        if (!card.isUnit() || !card.isInPlay()) {
            return false;
        }

        const properties = this.generatePropertiesFromContext(context);
        if ((properties.isCost || mustChangeGameState !== GameStateChangeRequired.None) && card.hasRestriction(AbilityRestriction.BeCaptured, context)) {
            return false;
        }

        if (properties.captor.isUnit() && !properties.captor.isInPlay()) {
            return false;
        }

        return super.canAffectInternal(card, context);
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties?: Partial<TProperties>) {
        return super.generatePropertiesFromContext(context, { captor: context.source, ...additionalProperties });
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const { captor, target } = this.generatePropertiesFromContext(context);

        if (captor === context.source) {
            return super.getEffectMessage(context);
        }

        if (captor.controller !== context.source.controller) {
            return ['make {0} capture {1}', [
                this.getTargetMessage(captor, context),
                this.getTargetMessage(target, context)
            ]];
        }

        return ['capture {0} with {1}', [
            this.getTargetMessage(target, context),
            this.getTargetMessage(captor, context)
        ]];
    }

    public override addPropertiesToEvent(event: any, card: Card, context: TContext, additionalProperties?: Partial<TProperties>): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        const { captor } = this.generatePropertiesFromContext(context);

        Contract.assertTrue(
            (captor.isUnit() && captor.isInPlay()) || captor.isBase(),
            `Attempting to capture card ${card.internalName} for card ${captor.internalName} but the captor is neither an in-play unit nor a base`
        );

        event.captor = captor;
    }

    protected override updateEvent(event, card: Card, context: TContext, additionalProperties: Partial<TProperties>): void {
        super.updateEvent(event, card, context, additionalProperties);
        this.addLeavesPlayPropertiesToEvent(event, card, context, additionalProperties);
    }
}
