import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Trait, WildcardCardType } from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { Card } from '../../../core/card/Card';
import type { Player } from '../../../core/Player';

export default class ExecuteOrder66 extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4569767827',
            internalName: 'execute-order-66',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 6 damage to each Jedi unit.',
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 6,
                target: this.getJedisInPlay(context)
            })),
            then: (thenContext) => ({
                title: 'For each unit defeated this way, its controller creates a Clone Trooper token.',
                thenCondition: () => thenContext.resolvedEvents.length > 0,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    this.createCloneTroopers(thenContext, thenContext.player, AbilityHelper),
                    this.createCloneTroopers(thenContext, thenContext.player.opponent, AbilityHelper)
                ])
            })
        });
    }

    private getJedisInPlay(context): Card[] {
        const playerJedis = context.player.getArenaUnits({ trait: Trait.Jedi, type: WildcardCardType.Unit });
        const opponentJedis = context.player.opponent.getArenaUnits({ trait: Trait.Jedi, type: WildcardCardType.Unit });
        return playerJedis.concat(opponentJedis);
    }

    private createCloneTroopers(thenContext: AbilityContext<Card>, player: Player, AbilityHelper: IAbilityHelper) {
        const numberClones = thenContext.resolvedEvents.reduce((total, e) => total + (e.willDefeat && e.card.controller === player ? 1 : 0), 0);

        return AbilityHelper.immediateEffects.createCloneTrooper({
            amount: numberClones,
            target: player
        });
    }
}
