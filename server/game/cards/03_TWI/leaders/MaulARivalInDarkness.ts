import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class MaulARivalInDarkness extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6461101372',
            internalName: 'maul#a-rival-in-darkness',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Attack with a unit. It gains Overwhelm for this attack',
            cost: [AbilityHelper.costs.exhaustSelf()],
            initiateAttack: {
                attackerLastingEffects: [
                    { effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Overwhelm }) },
                ]
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addConstantAbility({
            title: 'Each other friendly unit gains Overwhelm',
            matchTarget: (card, context) => card.isUnit() && card.controller === context.source.controller && card !== context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Overwhelm })
        });
    }
}

MaulARivalInDarkness.implemented = true;
