import AbilityHelper from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

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

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar) {
        registrar.addConstantAbility(this.buildHeraAbilityProperties());
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility(this.buildHeraAbilityProperties());

        registrar.addOnAttackAbility({
            title: 'Give an experience token to another unique unit',
            optional: true,
            targetResolver: {
                controller: WildcardRelativePlayer.Any,
                cardCondition: (card, context) => card.unique && card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}
