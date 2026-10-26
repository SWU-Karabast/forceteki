import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName, RelativePlayer, TargetMode, ZoneName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class KeeperOfSkaraNalAwoken extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4533738134',
            internalName: 'keeper-of-skara-nal#awoken',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: `Discard 2 cards named Keeper of Skara Nal from your hand. If you do, this unit gets +15/+0 and gains ${TextHelper.Overwhelm} for this attack.`,
            optional: true,
            targetResolver: {
                activePromptTitle: 'Choose 2 cards named Keeper of Skara Nal from your hand to discard',
                mode: TargetMode.Exactly,
                numCards: 2,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                cardCondition: (card) => card.title === 'Keeper of Skara Nal',
                immediateEffect: abilityHelper.immediateEffects.discardSpecificCard()
            },
            ifYouDo: {
                title: `This unit gets +15/+0 and gains ${TextHelper.Overwhelm} for this attack`,
                immediateEffect: abilityHelper.immediateEffects.forThisAttackCardEffect({
                    effect: [
                        abilityHelper.ongoingEffects.modifyStats({ power: 15, hp: 0 }),
                        abilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm)
                    ]
                })
            }
        });
    }
}