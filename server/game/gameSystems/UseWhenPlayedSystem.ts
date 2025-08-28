import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { EventName, GameStateChangeRequired, Stage, WildcardCardType, ZoneName } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import TriggeredAbility from '../core/ability/TriggeredAbility';
import type { GameEvent } from '../core/event/GameEvent';
import type { ITriggeredAbilityProps } from '../Interfaces';
import { PlayCardSystem } from './PlayCardSystem';
import { GameObjectBase } from '../core/GameObjectBase';

export interface IUseWhenPlayedProperties extends ICardTargetSystemProperties {
    triggerAll?: boolean;
    resolvedAbilityEvent?: GameEvent;
}

export class UseWhenPlayedSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IUseWhenPlayedProperties> {
    public override readonly name = 'use when played';
    public override readonly eventName = EventName.OnUseWhenPlayed;
    public override readonly effectDescription = 'use {0}\'s When Played ability';
    protected override readonly targetTypeFilter = [WildcardCardType.Unit, WildcardCardType.Upgrade];

    protected override defaultProperties: IUseWhenPlayedProperties = {
        triggerAll: false,
        resolvedAbilityEvent: null
    };

    public eventHandler(event): void {
        const whenPlayedSource = event.whenPlayedSource;
        const triggerAll = event.triggerAll;
        const onCardPlayedEvent = event.onCardPlayedEvent;
        const whenPlayedAbilities: TriggeredAbility[] = onCardPlayedEvent == null ? event.whenPlayedAbilities : [event.resolvedAbility];

        if (whenPlayedAbilities.length === 1 || triggerAll) {
            whenPlayedAbilities.forEach((whenPlayedAbility) => {
                this.useWhenPlayedAbility(whenPlayedAbility, whenPlayedSource, event, onCardPlayedEvent);
            });
        } else {
            const player = event.context.player;
            const choices = whenPlayedAbilities.map((ability) => ability.properties.title);

            const promptProperties = {
                activePromptTitle: 'Choose a When Played ability to use',
                waitingPromptTitle: 'Waiting for opponent to choose a When Played ability',
                context: event.context,
                source: event.whenPlayedSource
            };

            const handlers = whenPlayedAbilities.map(
                (whenPlayedAbility) => {
                    return () => {
                        this.useWhenPlayedAbility(whenPlayedAbility, whenPlayedSource, event, onCardPlayedEvent);
                    };
                }
            );

            const completeProps = { ...promptProperties, choices, handlers };

            event.context.game.promptWithHandlerMenu(player, completeProps);
        }
    }

    private useWhenPlayedAbility(whenPlayedAbility: TriggeredAbility, whenPlayedSource: Card, event, onCardPlayedEvent = null) {
        const whenPlayedProps = { ...(whenPlayedAbility.properties as ITriggeredAbilityProps), optional: false, target: whenPlayedSource };
        const ability = GameObjectBase.createWithoutRefs(() => new TriggeredAbility(event.context.game, whenPlayedSource, whenPlayedProps));

        event.context.game.resolveAbility(ability.createContext(event.context.player, onCardPlayedEvent));
    }

    // Since the actual When Played effect is resolved in a sub-window, we don't check its effects here
    public override canAffectInternal(card: Card, context: TContext, additionalProperties: Partial<IUseWhenPlayedProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const { resolvedAbilityEvent } = this.generatePropertiesFromContext(context);

        if (resolvedAbilityEvent === null) {
            if (
                card.zoneName !== ZoneName.GroundArena &&
                card.zoneName !== ZoneName.SpaceArena &&
                card.zoneName !== ZoneName.Resource
            ) {
                return false;
            }

            if (!card.canRegisterTriggeredAbilities() || !card.getTriggeredAbilities().some((ability) => ability.isWhenPlayed)) {
                return false;
            }

            if (mustChangeGameState !== GameStateChangeRequired.None) {
                return card.getTriggeredAbilities().some((ability) => {
                    const cardPlayedEvent = new PlayCardSystem({
                        ...ability.properties,
                        playAsType: null
                    }).generateEvent(context);
                    const abilityContext = ability.createContext(context.player, cardPlayedEvent);
                    abilityContext.stage = Stage.PreTarget;
                    return ability.meetsRequirements(abilityContext) === '';
                });
            }
        } else {
            const ability = (resolvedAbilityEvent as any).ability;
            if (!resolvedAbilityEvent.context.isTriggered() || !ability.isWhenPlayed) {
                return false;
            }

            const onCardPlayedEvent = this.getOnCardPlayedEvent(resolvedAbilityEvent);

            if (mustChangeGameState !== GameStateChangeRequired.None) {
                const abilityContext = ability.createContext(context.player, onCardPlayedEvent);
                abilityContext.stage = Stage.PreTarget;
                return ability.meetsRequirements(abilityContext) === '';
            }
        }

        return super.canAffectInternal(card, context, additionalProperties, mustChangeGameState);
    }

    private getOnCardPlayedEvent(resolvedAbilityEvent: any) {
        return resolvedAbilityEvent?.context.event;
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        const { triggerAll, resolvedAbilityEvent } = this.generatePropertiesFromContext(context, additionalProperties);
        event.triggerAll = triggerAll;
        event.onCardPlayedEvent = this.getOnCardPlayedEvent(resolvedAbilityEvent);
        event.resolvedAbility = (resolvedAbilityEvent as any)?.ability;
        event.whenPlayedSource = card;
        event.whenPlayedAbilities = card.canRegisterTriggeredAbilities() ? card.getTriggeredAbilities().filter((ability) => ability.isWhenPlayed) : [];
    }
}
