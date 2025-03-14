import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import * as Contract from '../core/utils/Contract.js';
import { EventName, GameStateChangeRequired, WildcardCardType } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import TriggeredAbility from '../core/ability/TriggeredAbility';
import { DefeatCardSystem } from './DefeatCardSystem';

export interface IUseWhenDefeatedProperties extends ICardTargetSystemProperties {
    triggerAll?: boolean;
}

export class UseWhenDefeatedSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IUseWhenDefeatedProperties> {
    public override readonly name = 'use when defeated';
    public override readonly eventName = EventName.OnUseWhenDefeated;
    protected override readonly targetTypeFilter = [WildcardCardType.Unit]; // TODO - add Upgrades for Thrawn

    protected override defaultProperties: IUseWhenDefeatedProperties = {
        triggerAll: false
    };

    public eventHandler(event): void {
        const whenDefeatedSource = event.whenDefeatedSource;
        const triggerAll = event.triggerAll; // TODO: Will use with Shadow Caster
        const whenDefeatedAbilities: TriggeredAbility[] = whenDefeatedSource.getTriggeredAbilities().filter((ability) => ability.isWhenDefeated);
        Contract.assertTrue(whenDefeatedAbilities.length > 0, 'No When Defeated abilities found on card');

        if (whenDefeatedAbilities.length === 1 || triggerAll) {
            whenDefeatedAbilities.forEach((whenDefeatedAbility) => {
                this.useWhenDefeatedAbility(whenDefeatedAbility, whenDefeatedSource, event);
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
                        this.useWhenDefeatedAbility(whenDefeatedAbility, whenDefeatedSource, event);
                    };
                }
            );

            Object.assign(promptProperties, { choices, handlers });

            event.context.game.promptWithHandlerMenu(player, promptProperties);
        }
    }

    private useWhenDefeatedAbility(triggeredAbility: TriggeredAbility, whenDefeatedSource: Card, event) {
        const whenDefeatedProps = { ...triggeredAbility.properties, optional: false, target: whenDefeatedSource };
        const ability = new TriggeredAbility(event.context.game, whenDefeatedSource, whenDefeatedProps);

        // This is needed for cards that use Last Known Information i.e. Raddus
        const whenDefeatedEvent = new DefeatCardSystem(whenDefeatedProps).generateEvent(event.context, event.whenDefeatedSource, true);

        event.context.game.resolveAbility(ability.createContext(event.context.player, whenDefeatedEvent));
    }

    // Since the actual When Defeated effect is resolved in a sub-window, we don't check its effects here
    public override canAffect(card: Card, context: TContext, additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        if (!card.canRegisterTriggeredAbilities() || !card.getTriggeredAbilities().some((ability) => ability.isWhenDefeated)) {
            return false;
        }

        return super.canAffect(card, context, additionalProperties, mustChangeGameState);
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        const { triggerAll } = this.generatePropertiesFromContext(context, additionalProperties);
        event.triggerAll = triggerAll;
        event.whenDefeatedSource = card;
    }
}
