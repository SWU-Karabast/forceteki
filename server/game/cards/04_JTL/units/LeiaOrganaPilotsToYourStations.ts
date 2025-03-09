import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class LeiaOrganaPilotsToYourStations extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7924461681',
            internalName: 'leia-organa#pilots-to-your-stations',
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Attack with a Pilot unit or a unit with a Pilot on it. It gets +1/+0 and gainsRestore 1 for this attack.',
            optional: true,
            initiateAttack: {
                attackerCondition: (card) => card.isUnit() && (card.hasSomeTrait(Trait.Pilot) || card.upgrades.some((upgrade) => upgrade.hasSomeTrait(Trait.Pilot))),
                attackerLastingEffects:
                [{
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 }),
                },
                {
                    effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 1 })
                }]
            }
        });
    }
}
