import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class LeiaOrganaAllianceGeneral extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6514927936',
            internalName: 'leia-organa#alliance-general',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: `Attack with a ${TextHelper.Trait.Rebel} unit`,
            cost: AbilityHelper.costs.exhaustSelf(),
            initiateAttack: {
                attackerCondition: (card) => card.hasSomeTrait(Trait.Rebel)
            },
            then: (thenContext) => ({
                title: `Attack with a second ${TextHelper.Trait.Rebel} unit`,
                optional: true,
                initiateAttack: {
                    attackerCondition: (card) => card.hasSomeTrait(Trait.Rebel) && thenContext.target !== card
                }
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar) {
        registrar.addWhenAttackEndsAbility({
            title: `Attack with another ${TextHelper.Trait.Rebel} unit`,
            attackerMustSurvive: true,
            optional: true,
            initiateAttack: {
                attackerCondition: (card, context) => card.hasSomeTrait(Trait.Rebel) && card !== context.source
            }
        });
    }
}
