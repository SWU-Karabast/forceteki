import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, KeywordName, RelativePlayer, TargetMode, Trait, WildcardCardType } from '../../../core/Constants';
import type { KeywordNameOrProperties } from '../../../Interfaces';

export default class AdmiralYularenFleetCoordinator extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3148212344',
            internalName: 'admiral-yularen#fleet-coordinator',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: `Choose Grit, Restore 1, Sentinel, or Shielded. While ${this.title} is in play, each friendly Vehicle unit gains the chosen keyword.`,
            targetResolver: {
                mode: TargetMode.Select,
                activePromptTitle: 'Choose Grit, Restore 1, Sentinel, or Shielded',
                choices: {
                    ['Grit']: this.buildYularenEffect(KeywordName.Grit, 'Grit'),
                    ['Restore 1']: this.buildYularenEffect({ keyword: KeywordName.Restore, amount: 1 }, 'Restore 1'),
                    ['Sentinel']: this.buildYularenEffect(KeywordName.Sentinel, 'Sentinel'),
                    ['Shielded']: this.buildYularenEffect(KeywordName.Shielded, 'Shielded')
                }
            }
        });
    }

    private buildYularenEffect(choice: KeywordNameOrProperties, keywordDescription: string) {
        return AbilityHelper.immediateEffects.whileSourceInPlayCardEffect({
            ongoingEffectDescription: `give ${keywordDescription} to`,
            ongoingEffectTargetDescription: 'each friendly Vehicle unit',
            effect: AbilityHelper.ongoingEffects.gainAbility({
                type: AbilityType.Constant,
                title: `Friendly Vehicle units gains ${choice}`,
                targetController: RelativePlayer.Self,
                targetCardTypeFilter: WildcardCardType.Unit,
                matchTarget: (card) => card.hasSomeTrait(Trait.Vehicle),
                ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(choice),
            })
        });
    }
}
