import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { DamageType } from '../../../core/Constants';

export default class SabeQueensShadow extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'sabe#queens-shadow-id',
            internalName: 'sabe#queens-shadow'
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Exhaust this leader. If you do, look at the top 2 cards of the defending player\'s deck. Discord 1 of those cards',
            when: {
                onDamageDealt: (event, context) =>
                    // TODO: refactor damage enum types to account for the fact that overwhelm is combat damage
                    event.damageSource?.attack?.attacker.controller === context.player &&
                    ((event.type === DamageType.Combat && event.damageSource.attack.getAllTargets().some((target) => target.isBase())) || event.type === DamageType.Overwhelm)
            },
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.exhaust(),
            ifYouDo: {
                title: 'Look at the top 2 cards of the defending player\'s deck. Discord 1 of those cards',
                immediateEffect: abilityHelper.immediateEffects.lookAtAndSelectCard((context) => ({
                    target: context.player.opponent.getTopCardsOfDeck(2),
                    canChooseFewer: false,
                    immediateEffect: abilityHelper.immediateEffects.discardSpecificCard(),
                }))
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Look at the opponent\'s hand. You may discard a card from it. If you do, that player draws a card.',
            when: {
                onDamageDealt: (event, context) =>
                    // TODO: refactor damage enum types to account for the fact that overwhelm is combat damage
                    event.damageSource?.attack?.attacker === context.source &&
                    ((event.type === DamageType.Combat && event.damageSource.attack.getAllTargets().some((target) => target.isBase())) || event.type === DamageType.Overwhelm)
            },
            immediateEffect: abilityHelper.immediateEffects.lookAtAndSelectCard((context) => ({
                target: context.player.opponent.hand,
                immediateEffect: abilityHelper.immediateEffects.sequential([
                    abilityHelper.immediateEffects.discardSpecificCard(),
                    abilityHelper.immediateEffects.draw((context) => ({ target: context.player.opponent }))
                ])
            }))
        });
    }
}
