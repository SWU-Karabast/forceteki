import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class LeiaOrganaAllianceGeneral extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6514927936',
            internalName: 'leia-organa#alliance-general',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Attack with a Rebel unit',
            cost: AbilityHelper.costs.exhaustSelf(),
            initiateAttack: {
                attackerCondition: (card) => card.hasSomeTrait(Trait.Rebel)
            },
            then: (thenContext) => ({
                title: 'Attack with a second Rebel unit',
                optional: true,
                initiateAttack: {
                    attackerCondition: (card) => card.hasSomeTrait(Trait.Rebel) && thenContext.target !== card
                }
            })
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addTriggeredAbility({
            title: 'Attack with another Rebel unit',
            optional: true,
            when: {
                onAttackCompleted: (event, context) => event.attack.attacker === context.source
            },
            initiateAttack: {
                attackerCondition: (card, context) => card.hasSomeTrait(Trait.Rebel) && card !== context.source
            }
        });
    }
}

LeiaOrganaAllianceGeneral.implemented = true;
