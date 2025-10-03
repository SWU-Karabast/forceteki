import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import {
    AbilityType,
    DamagePreventionType,
    KeywordName,
    RelativePlayer,
    Trait,
    WildcardCardType,
    ZoneName
} from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';
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
            title: 'Play a Force unit from your hand. It gains Ambush for this phase. The next time it would be dealt damage this phase prevent 2 of that damage',
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
                                AbilityHelper.ongoingEffects.gainAbility({
                                    title: 'The next time it would be dealt damage this phase prevent 2 of that damage',
                                    type: AbilityType.DamagePrevention,
                                    preventionType: DamagePreventionType.Reduce,
                                    preventionAmount: 2,
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