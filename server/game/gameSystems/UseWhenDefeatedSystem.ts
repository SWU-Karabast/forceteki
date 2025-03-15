import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { EventName, GameStateChangeRequired, Stage, WildcardCardType } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import TriggeredAbility from '../core/ability/TriggeredAbility';
import { DefeatCardSystem } from './DefeatCardSystem';
import type { GameEvent } from '../core/event/GameEvent';

export interface IUseWhenDefeatedProperties extends ICardTargetSystemProperties {
    triggerAll?: boolean;
    originalEvent?: GameEvent;
}

export class UseWhenDefeatedSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IUseWhenDefeatedProperties> {
    public override readonly name = 'use when defeated';
    public override readonly eventName = EventName.OnUseWhenDefeated;
    protected override readonly targetTypeFilter = [WildcardCardType.Unit]; // TODO - add Upgrades for Thrawn

    protected override defaultProperties: IUseWhenDefeatedProperties = {
        triggerAll: false,
        originalEvent: null
    };

    public eventHandler(event): void {
        const whenDefeatedSource = event.whenDefeatedSource;
        const triggerAll = event.triggerAll; // TODO: Will use with Shadow Caster
        const originalEvent = event.originalEvent;
        const whenDefeatedAbilities: TriggeredAbility[] = originalEvent === null ? event.whenDefeatedAbilities : [originalEvent.ability];

        if (whenDefeatedAbilities.length === 1 || triggerAll) {
            whenDefeatedAbilities.forEach((whenDefeatedAbility) => {
                this.useWhenDefeatedAbility(whenDefeatedAbility, whenDefeatedSource, event, originalEvent);
            });
        } else {
            const player = event.context.player;
            const choices = whenDefeatedAbilities.map((ability) => ability.properties.title);

            const promptProperties = {
                activePromptTitle: 'Choose a When Defeated ability to use',
                waitingPromptTitle: 'Waiting for opponent to choose a When Defeated ability',
                context: event.context,
                source: event.whenDefeatedSource
            };

            const handlers = whenDefeatedAbilities.map(
                (whenDefeatedAbility) => {
                    return () => {
                        this.useWhenDefeatedAbility(whenDefeatedAbility, whenDefeatedSource, event, originalEvent);
                    };
                }
            );

            Object.assign(promptProperties, { choices, handlers });

            event.context.game.promptWithHandlerMenu(player, promptProperties);
        }
    }

    private useWhenDefeatedAbility(whenDefeatedAbility: TriggeredAbility, whenDefeatedSource: Card, event, originalEvent = null) {
        const whenDefeatedProps = { ...whenDefeatedAbility.properties, optional: false, target: whenDefeatedSource };
        const ability = new TriggeredAbility(event.context.game, whenDefeatedSource, whenDefeatedProps);

        // This is needed for cards that use Last Known Information i.e. Raddus
        const whenDefeatedEvent = originalEvent || new DefeatCardSystem(whenDefeatedProps).generateEvent(event.context, whenDefeatedSource, true);

        event.context.game.resolveAbility(ability.createContext(event.context.player, whenDefeatedEvent));
    }

    // Since the actual When Defeated effect is resolved in a sub-window, we don't check its effects here
    public override canAffect(card: Card, context: TContext, additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const { originalEvent } = this.generatePropertiesFromContext(context);

        if (originalEvent === null) {
            if (!card.canRegisterTriggeredAbilities() || !card.getTriggeredAbilities().some((ability) => ability.isWhenDefeated)) {
                return false;
            }

            if (mustChangeGameState !== GameStateChangeRequired.None) {
                return card.getTriggeredAbilities().some((ability) => {
                    const whenDefeatedEvent = new DefeatCardSystem(ability.properties).generateEvent(context, card, true);
                    const abilityContext = ability.createContext(context.player, whenDefeatedEvent);
                    abilityContext.stage = Stage.PreTarget;
                    return ability.meetsRequirements(abilityContext) === '';
                });
            }
        } else {
            const ability = (originalEvent as any).ability;
            if (!ability.isWhenDefeated) {
                return false;
            }

            if (mustChangeGameState !== GameStateChangeRequired.None) {
                const abilityContext = ability.createContext(context.player, originalEvent);
                abilityContext.stage = Stage.PreTarget;
            }
        }

        return super.canAffect(card, context, additionalProperties, mustChangeGameState);
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        const { triggerAll, originalEvent } = this.generatePropertiesFromContext(context, additionalProperties);
        event.triggerAll = triggerAll;
        event.originalEvent = originalEvent;
        event.whenDefeatedSource = card;
        event.whenDefeatedAbilities = card.canRegisterTriggeredAbilities() ? card.getTriggeredAbilities().filter((ability) => ability.isWhenDefeated) : [];
    }
}
