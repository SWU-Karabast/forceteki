import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { EventName, GameStateChangeRequired } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import type { ILastingEffectPropertiesBase } from '../core/gameSystem/LastingEffectPropertiesBase';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type { IOngoingAllCardsForPlayerEffectProps } from '../core/ongoingEffect/OngoingAllCardsForPlayerEffect';
import { AllCardsTargetMode } from '../core/ongoingEffect/OngoingAllCardsForPlayerEffect';
import type { Player } from '../core/Player';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import * as Helpers from '../core/utils/Helpers';
import type { IOngoingAllCardsForPlayerEffectGenerator, IOngoingPlayerEffectGenerator, IOngoingPlayerEffectProps } from '../Interfaces';
import * as LastingEffectSystemHelpers from './helpers/LastingEffectSystemHelpers';

export type IAllCardsForPlayerLastingEffectProperties = Helpers.DistributiveOmit<ILastingEffectPropertiesBase, 'target' | 'effect'> & Pick<IPlayerTargetSystemProperties, 'target'> & {
    effect: IOngoingAllCardsForPlayerEffectGenerator | IOngoingAllCardsForPlayerEffectGenerator[];
    cardTitle: string;
    includeLeaders?: boolean;
    cardTargetMode?: AllCardsTargetMode;
};

/**
 * Helper subclass of {@link CardLastingEffectSystem} that specifically creates lasting effects targeting cards
 * which will last while the source of the effect is in play.
 */
export class AllCardsForPlayerLastingEffectSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IAllCardsForPlayerLastingEffectProperties> {
    public override readonly name = 'applyAllCardsForPlayerLastingEffect';
    public override readonly eventName = EventName.OnEffectApplied;
    protected override readonly defaultProperties: IAllCardsForPlayerLastingEffectProperties = {
        duration: null,
        effect: [],
        ability: null,
        cardTitle: null,
        includeLeaders: false,
        cardTargetMode: AllCardsTargetMode.OnlyOwned
    };

    public eventHandler(event): void {
        const effects = Helpers.asArray(event.effectProperties).flatMap((props: IOngoingPlayerEffectProps) =>
            (event.effectFactories as IOngoingPlayerEffectGenerator[]).map((factory) =>
                factory(event.context.game, event.context.source, props)
            )
        );

        for (const effect of effects) {
            event.context.game.ongoingEffectEngine.add(effect);
        }
    }

    public override addPropertiesToEvent(event: any, target: Player, context: TContext, additionalProperties?: Partial<IAllCardsForPlayerLastingEffectProperties>): void {
        super.addPropertiesToEvent(event, target, context, additionalProperties);

        const { effectFactories, effectProperties } = this.getEffectFactoriesAndProperties(target, context, additionalProperties);

        event.effectFactories = effectFactories;
        event.effectProperties = effectProperties;
    }

    private getEffectFactoriesAndProperties(target: Player, context: TContext, additionalProperties?: Partial<IAllCardsForPlayerLastingEffectProperties>): { effectFactories: IOngoingAllCardsForPlayerEffectGenerator[]; effectProperties: IOngoingAllCardsForPlayerEffectProps };
    private getEffectFactoriesAndProperties(target: Player[], context: TContext, additionalProperties?: Partial<IAllCardsForPlayerLastingEffectProperties>): { effectFactories: IOngoingAllCardsForPlayerEffectGenerator[]; effectProperties: IOngoingAllCardsForPlayerEffectProps[] };
    private getEffectFactoriesAndProperties(target: Player | Player[], context: TContext, additionalProperties?: Partial<IAllCardsForPlayerLastingEffectProperties>): { effectFactories: IOngoingAllCardsForPlayerEffectGenerator[]; effectProperties: IOngoingAllCardsForPlayerEffectProps | IOngoingAllCardsForPlayerEffectProps[] };
    private getEffectFactoriesAndProperties(target: Player | Player[], context: TContext, additionalProperties?: Partial<IAllCardsForPlayerLastingEffectProperties>): { effectFactories: IOngoingAllCardsForPlayerEffectGenerator[]; effectProperties: IOngoingAllCardsForPlayerEffectProps | IOngoingAllCardsForPlayerEffectProps[] } {
        const { effect, cardTitle, includeLeaders, cardTargetMode, target: _propsTarget, ...otherProperties } = this.generatePropertiesFromContext(context, additionalProperties);

        const matchTarget = (target: Card) => {
            if (target.title !== cardTitle) {
                return false;
            }

            return includeLeaders || !target.isLeader;
        };

        const effectProperties: (target: Player) => IOngoingAllCardsForPlayerEffectProps = (target) => ({
            matchTarget,
            targetController: EnumHelpers.asRelativePlayer(target, context.source.controller),
            cardTargetMode,
            isLastingEffect: true,
            ability: context.ability,
            ...otherProperties
        });

        if (Array.isArray(target)) {
            return { effectFactories: Helpers.asArray(effect), effectProperties: target.map((card) => effectProperties(card)) };
        }

        return { effectFactories: Helpers.asArray(effect), effectProperties: effectProperties(target) };
    }

    public override hasLegalTarget(context: TContext, additionalProperties: Partial<IAllCardsForPlayerLastingEffectProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.effect.length > 0 && super.hasLegalTarget(context, additionalProperties, mustChangeGameState);
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<IAllCardsForPlayerLastingEffectProperties>): void {
        if (this.hasLegalTarget(context, additionalProperties)) {
            events.push(this.generateEvent(context, additionalProperties));
        }
    }

    public override defaultTargets(context: TContext): Player[] {
        return context.player ? [context.player] : [];
    }

    public override getEffectMessage(context: TContext, additionalProperties?: Partial<IAllCardsForPlayerLastingEffectProperties>): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        return LastingEffectSystemHelpers.getEffectMessage<TContext, IAllCardsForPlayerLastingEffectProperties>(
            this,
            context,
            properties,
            additionalProperties,
            // TODO: fix the type for the below, the type inference on getEffectMessage() is struggling with the TProperties generic
            (target, context, additionalProps) => this.getEffectFactoriesAndProperties(target, context, additionalProps) as any
        );
    }
}
