import AbilityHelper from '../../AbilityHelper';
import { LeaderUnitCard } from '../../core/card/LeaderUnitCard';
import { RelativePlayer, Trait } from '../../core/Constants';

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
            targetResolver: {
                cardCondition: (card) => card.hasSomeTrait(Trait.Rebel),
                immediateEffect: AbilityHelper.immediateEffects.initiateUnitAttack()
            },
            then: {
                title: 'Attack with a second Rebel unit',
                optional: true,
                targetResolver: {
                    cardCondition: (card) => card.hasSomeTrait(Trait.Rebel),
                    immediateEffect: AbilityHelper.immediateEffects.initiateUnitAttack()
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addOnAttackAbility({
            title: 'Attack with another Rebel unit',
            optional: true,
            targetResolver: {
                cardCondition: (card, context) => card.hasSomeTrait(Trait.Rebel) && card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.initiateUnitAttack()
            }
        });
    }
}

LeiaOrganaAllianceGeneral.implemented = true;
