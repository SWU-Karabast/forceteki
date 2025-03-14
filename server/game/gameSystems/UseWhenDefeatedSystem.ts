import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import * as Contract from '../core/utils/Contract.js';
import { EventName, GameStateChangeRequired, WildcardCardType } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import TriggeredAbility from '../core/ability/TriggeredAbility';

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
        const triggerAll = event.triggerAll;
        const whenDefeatedAbilities = whenDefeatedSource.getTriggeredAbilities().filter((ability) => ability.isWhenDefeated);
        Contract.assertTrue(whenDefeatedAbilities.length > 0, 'No When Defeated abilities found on card');

        // TODO: Modal for multiple When Defeated abilities
        if (whenDefeatedAbilities.length === 1) {
            const whenDefeatedProps = { ...whenDefeatedAbilities[0].properties, optional: false };
            const ability = new TriggeredAbility(event.context.game, whenDefeatedSource, whenDefeatedProps);

            event.context.game.resolveAbility(ability.createContext(event.context.player, event));
        } else {
            const player = event.context.player;
            const choices = whenDefeatedAbilities.map((ability) => ability.properties.title); // TODO: Are Titles too verbose in general for this?

            const promptProperties = {
                activePromptTitle: 'Choose a When Defeated ability to use',
                waitingPromptTitle: 'Waiting for opponent to choose a When Defeated ability',
                context: event.context,
                source: event.whenDefeatedSource // TODO: should this be Chimaera?
            };

            const handlers = whenDefeatedAbilities.map(
                (whenDefeatedAbility) => {
                    return () => {
                        const whenDefeatedProps = { ...whenDefeatedAbility.properties, optional: false };
                        const ability = new TriggeredAbility(event.context.game, whenDefeatedSource, whenDefeatedProps);

                        event.context.game.resolveAbility(ability.createContext(event.context.player, event));
                    };
                }
            );

            Object.assign(promptProperties, { choices, handlers });

            event.context.game.promptWithHandlerMenu(player, promptProperties);
        }
    }

    // since the actual effect of the bounty is resolved in a sub-window, we don't check its effects here
    public override canAffect(card: Card, context: TContext, additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        return card.canRegisterTriggeredAbilities() && card.getTriggeredAbilities().some((ability) => ability.isWhenDefeated);
        // && super.canAffect(card, context, additionalProperties, mustChangeGameState); TODO: add this back in if it doesn't break anything
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        const { triggerAll } = this.generatePropertiesFromContext(context, additionalProperties);
        event.triggerAll = triggerAll;
        event.whenDefeatedSource = card;
    }
}
