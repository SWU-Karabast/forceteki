import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { Trait, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class BossNassOtohGungaBoss extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'boss-nass#otoh-gunga-boss-id',
            internalName: 'boss-nass#otoh-gunga-boss',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: `Defeat a Shield token on a friendly ${TextHelper.Trait.Gungan} unit to create a Beast token and give a Shield token to it`,
            optional: true,
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                cardCondition: (card, context) => card.isShield() && card.parentCard.controller === context.player && card.parentCard.hasSomeTrait(Trait.Gungan),
                immediateEffect: abilityHelper.immediateEffects.defeat(),
            },
            ifYouDo: {
                title: 'Create a Beast token and give a Shield token to it',
                immediateEffect: abilityHelper.immediateEffects.sequential([
                    abilityHelper.immediateEffects.createBeast(),
                    abilityHelper.immediateEffects.giveShield((context) => ({ target: context.resolvedEvents[0]?.generatedTokens }))
                ])
            }
        });
    }
}