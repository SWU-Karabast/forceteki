import type { IAbilityHelper } from '../../../AbilityHelper';
import * as KeywordHelpers from '../../../core/ability/KeywordHelpers';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, KeywordName, TargetMode, Trait, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';
import type { KeywordNameOrProperties } from '../../../Interfaces';
import type { Player } from '../../../core/Player';

export default class AdmiralYularenFleetCoordinator extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3148212344',
            internalName: 'admiral-yularen#fleet-coordinator',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Choose Grit, Restore 1, Sentinel, or Shielded. While ${this.title} is in play, each friendly Vehicle unit gains the chosen keyword.`,
            targetResolver: {
                mode: TargetMode.Select,
                activePromptTitle: 'Choose Grit, Restore 1, Sentinel, or Shielded',
                choices: (context) => {
                    const playedByPlayer = context.player;
                    return {
                        ['Grit']: this.buildYularenEffect(KeywordName.Grit, AbilityHelper, playedByPlayer),
                        ['Restore 1']: this.buildYularenEffect({ keyword: KeywordName.Restore, amount: 1 }, AbilityHelper, playedByPlayer),
                        ['Sentinel']: this.buildYularenEffect(KeywordName.Sentinel, AbilityHelper, playedByPlayer),
                        ['Shielded']: this.buildYularenEffect(KeywordName.Shielded, AbilityHelper, playedByPlayer)
                    };
                }
            }
        });
    }

    private buildYularenEffect(choice: KeywordNameOrProperties, AbilityHelper: IAbilityHelper, playedByPlayer: Player) {
        return AbilityHelper.immediateEffects.whileSourceInPlayCardEffect({
            title: `Each friendly Vehicle unit gains ${KeywordHelpers.keywordDescription(choice)}`,
            ongoingEffectDescription: `give ${KeywordHelpers.keywordDescription(choice)} to`,
            ongoingEffectTargetDescription: 'each friendly Vehicle unit',
            effect: AbilityHelper.ongoingEffects.gainAbility({
                type: AbilityType.Constant,
                title: `Friendly Vehicle units gains ${choice}`,
                targetController: WildcardRelativePlayer.Any,
                targetCardTypeFilter: WildcardCardType.Unit,
                matchTarget: (card) => card.hasSomeTrait(Trait.Vehicle) && card.controller === playedByPlayer,
                ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(choice),
            })
        });
    }
}
