import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class HeraSyndullaSpectreTwo extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7440067052',
            internalName: 'hera-syndulla#spectre-two',
        };
    }

    private buildHeraAbilityProperties() {
        return {
            title: 'Ignore the aspect penalty on Spectre cards you play',
            targetController: RelativePlayer.Self,
            ongoingEffect: AbilityHelper.ongoingEffects.ignoreAllAspectPenalties({
                cardTypeFilter: WildcardCardType.Playable,
                match: (card) => card.hasSomeTrait(Trait.Spectre)
            })
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addConstantAbility(this.buildHeraAbilityProperties());
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addConstantAbility(this.buildHeraAbilityProperties());

        this.addOnAttackAbility({
            title: 'Give an experience token to another unique unit',
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Any,
                cardCondition: (card, context) => card.unique === true && card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}

HeraSyndullaSpectreTwo.implemented = true;
