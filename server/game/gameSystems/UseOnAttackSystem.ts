import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { EventName, GameStateChangeRequired, Stage, WildcardCardType, ZoneName } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import TriggeredAbility from '../core/ability/TriggeredAbility';
import type { GameEvent } from '../core/event/GameEvent';
import type { ITriggeredAbilityProps } from '../Interfaces';
import { InitiateAttackSystem } from './InitiateAttackSystem';

export interface IUseOnAttackProperties extends ICardTargetSystemProperties {
    resolvedAbilityEvent?: GameEvent;
}

export class UseOnAttackSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IUseOnAttackProperties> {
    public override readonly name = 'use on attack';
    public override readonly eventName = EventName.OnUseOnAttack;
    public override readonly effectDescription = 'use {0}\'s On Attack ability';
    protected override readonly targetTypeFilter = [WildcardCardType.Unit];

    protected override defaultProperties: IUseOnAttackProperties = {
        resolvedAbilityEvent: null
    };

    public eventHandler(event): void {
        const onAttackSource = event.onAttackSource;
        const triggerAll = event.triggerAll;
        const onAttackDeclaredEvent = event.onAttackDeclaredEvent;
        const onAttackAbilities: TriggeredAbility[] = onAttackDeclaredEvent == null ? event.onAttackAbilities : [event.resolvedAbility];

        if (onAttackAbilities.length === 1 || triggerAll) {
            onAttackAbilities.forEach((onAttackAbility) => {
                this.useOnAttackAbility(onAttackAbility, onAttackSource, event, onAttackDeclaredEvent);
            });
        } else {
            const player = event.context.player;
            const choices = onAttackAbilities.map((ability) => ability.properties.title);

            const promptProperties = {
                activePromptTitle: 'Choose an On Attack ability to use',
                waitingPromptTitle: 'Waiting for opponent to choose an On Attack ability',
                context: event.context,
                source: event.onAttackSource
            };

            const handlers = onAttackAbilities.map(
                (onAttackAbility) => {
                    return () => {
                        this.useOnAttackAbility(onAttackAbility, onAttackSource, event, onAttackDeclaredEvent);
                    };
                }
            );

            const completeProps = { ...promptProperties, choices, handlers };

            event.context.game.promptWithHandlerMenu(player, completeProps);
        }
    }

    private useOnAttackAbility(onAttackAbility: TriggeredAbility, onAttackSource: Card, event, onAttackDeclaredEvent = null) {
        const onAttackProps = { ...(onAttackAbility.properties as ITriggeredAbilityProps), optional: false, target: onAttackSource };
        const ability = event.context.game.gameObjectManager.createWithoutRefsUnsafe(() => new TriggeredAbility(event.context.game, onAttackSource, onAttackProps));

        event.context.game.resolveAbility(ability.createContext(event.context.player, onAttackDeclaredEvent));
    }

    // Since the actual On Attack effect is resolved in a sub-window, we don't check its effects here
    public override canAffectInternal(card: Card, context: TContext, additionalProperties: Partial<IUseOnAttackProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const { resolvedAbilityEvent } = this.generatePropertiesFromContext(context);

        if (resolvedAbilityEvent === null) {
            if (
                card.zoneName !== ZoneName.GroundArena &&
                card.zoneName !== ZoneName.SpaceArena &&
                card.zoneName !== ZoneName.Resource
            ) {
                return false;
            }

            if (!card.canRegisterTriggeredAbilities() || !card.getTriggeredAbilities().some((ability) => ability.isOnAttackAbility)) {
                return false;
            }

            if (mustChangeGameState !== GameStateChangeRequired.None) {
                return card.getTriggeredAbilities().some((ability) => {
                    const attackDeclaredEvent = new InitiateAttackSystem({
                        ...ability.properties
                    }).generateEvent(context);
                    const abilityContext = ability.createContext(context.player, attackDeclaredEvent);
                    abilityContext.stage = Stage.PreTarget;
                    return ability.meetsRequirements(abilityContext) === '';
                });
            }
        } else {
            const ability = (resolvedAbilityEvent as any).ability;
            if (!resolvedAbilityEvent.context.isTriggered() || !ability.isOnAttackAbility) {
                return false;
            }

            const onAttackDeclaredEvent = this.getOnAttackDeclaredEvent(resolvedAbilityEvent);

            if (mustChangeGameState !== GameStateChangeRequired.None) {
                const abilityContext = ability.createContext(context.player, onAttackDeclaredEvent);
                abilityContext.stage = Stage.PreTarget;
                return ability.meetsRequirements(abilityContext) === '';
            }
        }

        return super.canAffectInternal(card, context, additionalProperties, mustChangeGameState);
    }

    private getOnAttackDeclaredEvent(resolvedAbilityEvent: any) {
        return resolvedAbilityEvent?.context.event;
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        const { resolvedAbilityEvent } = this.generatePropertiesFromContext(context, additionalProperties);
        event.onAttackDeclaredEvent = this.getOnAttackDeclaredEvent(resolvedAbilityEvent);
        event.resolvedAbility = (resolvedAbilityEvent as any)?.ability;
        event.onAttackSource = card;
        event.onAttackAbilities = card.canRegisterTriggeredAbilities()
            ? card.getTriggeredAbilities().filter((ability) => ability.isOnAttackAbility)
            : [];
    }
}
