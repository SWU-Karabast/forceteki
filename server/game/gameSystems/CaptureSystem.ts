import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { GameStateChangeRequired, ZoneName, WildcardCardType, EventName, AbilityRestriction } from '../core/Constants';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';
import type { IUnitCard } from '../core/card/propertyMixins/UnitProperties';

export interface ICaptureProperties extends ICardTargetSystemProperties {

    /** Defaults to context.source, if used in an event must be provided explicitly */
    captor?: IUnitCard;
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

        if (!properties.captor.isInPlay() || !properties.captor.isUnit()) {
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
        return ['capture {0} with {1}', [this.getTargetMessage(target, context), captor]];
    }

    public override addPropertiesToEvent(event: any, card: Card, context: TContext, additionalProperties?: Partial<TProperties>): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        const { captor } = this.generatePropertiesFromContext(context);

        Contract.assertTrue(captor.isUnit(), `Attempting to capture card ${card.internalName} for card ${captor.internalName} but the captor is not a unit card`);
        Contract.assertTrue(captor.isInPlay(), `Attempting to capture card ${card.internalName} for card ${captor.internalName} but the captor is in non-play zone ${captor.zoneName}`);

        event.captor = captor;
    }

    protected override updateEvent(event, card: Card, context: TContext, additionalProperties: Partial<TProperties>): void {
        super.updateEvent(event, card, context, additionalProperties);
        this.addLeavesPlayPropertiesToEvent(event, card, context, additionalProperties);
    }
}
