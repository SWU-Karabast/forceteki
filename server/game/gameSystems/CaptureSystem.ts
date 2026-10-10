import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { GameStateChangeRequired, ZoneName, WildcardCardType, EventName, AbilityRestriction } from '../core/Constants';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import { Contract } from '../core/utils/Contract';
import type { ICaptorCard } from '../core/zone/CaptureZone';

export interface ICaptureProperties extends ICardTargetSystemProperties {

    /** Defaults to context.source, if used in an event must be provided explicitly */
    captor?: ICaptorCard;

    fromOutOfPlay?: boolean;
}

/**
 * Used for taking control of a unit in the arena
 */
export class CaptureSystem<TContext extends AbilityContext = AbilityContext, TProperties extends ICaptureProperties = ICaptureProperties> extends CardTargetSystem<TContext, TProperties> {
    public override readonly name = 'capture';
    public override readonly eventName = EventName.OnCardCaptured;
    public override readonly effectDescription = 'capture {0}';
    protected override readonly targetTypeFilter = [WildcardCardType.NonLeaderUnit];

    protected override defaultProperties: IGameSystemInput<ICaptureProperties> = {
        fromOutOfPlay: false,
    };

    protected override eventHandlerInternal(event): void {
        this.leavesPlayEventHandler(event.card, ZoneName.Capture, event.context, () => event.card.moveToCaptureZone(event.captor.captureZone));
    }

    protected override canAffectInternal(card: Card, context: TContext, properties: TProperties, mustChangeGameState = GameStateChangeRequired.None): boolean {
        if (!card.isUnit() || (!properties.fromOutOfPlay && !card.isInPlay())) {
            return false;
        }

        if ((properties.isCost || mustChangeGameState !== GameStateChangeRequired.None) && card.hasRestriction(AbilityRestriction.BeCaptured, context)) {
            return false;
        }

        if (properties.captor.isUnit() && !properties.captor.isInPlay()) {
            return false;
        }

        return super.canAffectInternal(card, context, properties, GameStateChangeRequired.None);
    }

    protected override prepareProperties(context: TContext, properties: TProperties): void {
        super.prepareProperties(context, properties);
        if (!('captor' in properties)) {
            Object.assign(properties, { captor: context.source });
        }
    }

    protected override getEffectMessageInternal(context: TContext, properties: TProperties): [string, any[]] {
        const { captor, target } = properties;

        if (captor === context.source) {
            return super.getEffectMessageInternal(context, properties);
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

    protected override addPropertiesToEvent(event: any, card: Card, context: TContext, properties: TProperties): void {
        super.addPropertiesToEvent(event, card, context, properties);
        const { captor } = properties;

        Contract.assertTrue(
            (captor.isUnit() && captor.isInPlay()) || captor.isBase(),
            `Attempting to capture card ${card.internalName} for card ${captor.internalName} but the captor is neither an in-play unit nor a base`
        );

        event.captor = captor;
    }

    protected override updateEvent(event, card: Card, context: TContext, properties: TProperties, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): void {
        super.updateEvent(event, card, context, properties, additionalProperties);
        if (card.canBeInPlay() && card.isInPlay()) {
            this.addLeavesPlayPropertiesToEvent(event, card, context, additionalProperties);
        }
    }
}
