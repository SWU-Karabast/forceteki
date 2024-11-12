import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, KeywordName, WildcardCardType } from '../../../core/Constants';

export default class TheClientDictatedByDiscretion extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1090660242',
            internalName: 'the-client#dictated-by-discretion'
        };
    }

    public override setupCardAbilities() {
        this.addActionAbility({
            title: 'Choose a unit. For this phase, it gains: "Bounty — Heal 5 damage from a base."',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainKeyword({
                        keyword: KeywordName.Bounty,
                        ability: {
                            title: 'Heal 5 damage from a base',
                            targetResolver: {
                                cardTypeFilter: CardType.Base,
                                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 5 })
                            }
                        }
                    })
                })
            }
        });
    }
}

TheClientDictatedByDiscretion.implemented = true;
