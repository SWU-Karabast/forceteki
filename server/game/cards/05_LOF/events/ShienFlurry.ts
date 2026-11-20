import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import {
    DamageModificationType,
    KeywordName,
    RelativePlayer,
    Trait,
    WildcardCardType,
    ZoneName
} from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { TextHelper } from '../../../core/utils/TextHelper';
import { ResolutionMode } from '../../../gameSystems/SimultaneousOrSequentialSystem';

export default class ShienFlurry extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7981459508',
            internalName: 'shien-flurry',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: `Play a ${TextHelper.Trait.Force} unit from your hand. It gains ${TextHelper.Ambush} for this phase. The next time it would be dealt damage this phase prevent 2 of that damage`,
            cannotTargetFirst: true,
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                cardCondition: (card) => card.hasSomeTrait(Trait.Force),
                immediateEffect: AbilityHelper.immediateEffects.simultaneous({
                    gameSystems: [
                        AbilityHelper.immediateEffects.playCardFromHand({
                            playAsType: WildcardCardType.Unit,
                        }),
                        AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                            effect: [
                                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush),
                                AbilityHelper.ongoingEffects.modifyDamage({
                                    title: 'The next time it would be dealt damage this phase prevent 2 of that damage',
                                    modificationType: DamageModificationType.Reduce,
                                    amount: 2,
                                    limit: AbilityHelper.limit.perGame(1)
                                })
                            ]
                        }),
                    ],
                    resolutionMode: ResolutionMode.AllGameSystemsMustBeLegal,
                })
            }
        });
    }
}