import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, KeywordName, TargetMode, Trait, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';
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
        const grit = TextHelper.Grit;
        const restore1 = TextHelper.Restore(1);
        const sentinel = TextHelper.Sentinel;
        const shielded = TextHelper.Shielded;

        registrar.addWhenPlayedAbility({
            title: `Choose ${grit}, ${restore1}, ${sentinel}, or ${shielded}. While ${this.title} is in play, each friendly ${TextHelper.Trait.Vehicle} unit gains the chosen keyword.`,
            contextTitle: (context) => `Choose ${grit}, ${restore1}, ${sentinel}, or ${shielded}. While ${context.source.title} is in play, each friendly ${TextHelper.Trait.Vehicle} unit gains the chosen keyword.`,
            targetResolver: {
                mode: TargetMode.Select,
                activePromptTitle: `Choose ${grit}, ${restore1}, ${sentinel}, or ${shielded}`,
                choices: (context) => {
                    const playedByPlayer = context.player;
                    return {
                        [grit]: this.buildYularenEffect(KeywordName.Grit, AbilityHelper, playedByPlayer),
                        [restore1]: this.buildYularenEffect({ keyword: KeywordName.Restore, amount: 1 }, AbilityHelper, playedByPlayer),
                        [sentinel]: this.buildYularenEffect(KeywordName.Sentinel, AbilityHelper, playedByPlayer),
                        [shielded]: this.buildYularenEffect(KeywordName.Shielded, AbilityHelper, playedByPlayer)
                    };
                }
            }
        });
    }

    private buildYularenEffect(choice: KeywordNameOrProperties, AbilityHelper: IAbilityHelper, playedByPlayer: Player) {
        return AbilityHelper.immediateEffects.whileSourceInPlayCardEffect({
            title: `Each friendly Vehicle unit gains ${TextHelper.keyword(choice)}`,
            ongoingEffectDescription: `give ${TextHelper.keyword(choice)} to`,
            ongoingEffectTargetDescription: `each friendly ${TextHelper.Trait.Vehicle} unit`,
            effect: AbilityHelper.ongoingEffects.gainAbility({
                type: AbilityType.Constant,
                title: `Friendly ${TextHelper.Trait.Vehicle} units gains ${TextHelper.keyword(choice)}`,
                targetController: WildcardRelativePlayer.Any,
                targetCardTypeFilter: WildcardCardType.Unit,
                matchTarget: (card) => card.hasSomeTrait(Trait.Vehicle) && card.controller === playedByPlayer,
                ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(choice),
            })
        });
    }
}
