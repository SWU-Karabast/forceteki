import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { KeywordName, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class ThreeLessons extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5074877387',
            internalName: 'three-lessons'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Play a unit from your hand. It gains Hidden for this phase. Give an Experience token and a Shield token to it.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.playCardFromHand({ playAsType: WildcardCardType.Unit }),
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Hidden)
                    }),
                    AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.giveExperience(),
                        AbilityHelper.immediateEffects.giveShield(),
                    ]),
                ])
            }
        });
    }
}