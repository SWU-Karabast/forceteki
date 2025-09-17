import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';

export default class LuthenRaelDontYouToFightForReal extends LeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'luthen-rael#dont-you-want-to-fight-for-real-id',
            internalName: 'luthen-rael#dont-you-want-to-fight-for-real',
        };
    }

    protected override setupLeaderSideAbilities (registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 1 damage to a unit or base',
            when: {
                onCardDefeated: (event, context) =>
                    event.card.controller === context.player &&
                    event.card.isUnit() &&
                    event.card.isInPlay() &&
                    event.card.isAttacking()
            },
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.exhaust(),
            ifYouDo: {
                title: 'Deal 1 damage to a unit or base',
                targetResolver: {
                    immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities (registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 2 damage to a unit or base',
            when: {
                onCardDefeated: (event, context) =>
                    event.card.controller === context.player &&
                    event.card.isUnit() &&
                    event.card.isInPlay() &&
                    event.card.isAttacking()
            },
            optional: true,
            targetResolver: {
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 2 })
            }
        });
    }
}