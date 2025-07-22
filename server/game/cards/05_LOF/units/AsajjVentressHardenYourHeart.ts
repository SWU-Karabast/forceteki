import { NonLeaderUnitCard } from '../../../../../server/game/core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class AsajjVentressHardenYourHeart extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'asajj-ventress#harden-your-heart-id',
            internalName: 'asajj-ventress#harden-your-heart',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Give another friendly Force unit +2/+0 for this phase',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card.hasSomeTrait(Trait.Force) && card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                })
            }
        });
    }
}