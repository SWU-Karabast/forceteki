import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class MaulARivalInDarkness extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6461101372',
            internalName: 'maul#a-rival-in-darkness',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Attack with a unit. It gains Overwhelm for this attack',
            cost: [AbilityHelper.costs.exhaustSelf()],
            initiateAttack: {
                attackerLastingEffects: [
                    { effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Overwhelm }) },
                ]
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each other friendly unit gains Overwhelm',
            matchTarget: (card, context) => card.isUnit() && card.controller === context.player && card !== context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Overwhelm })
        });
    }
}
