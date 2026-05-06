import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, ZoneName } from '../../../core/Constants';

export default class C3PODieJediDogs extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9349017358',
            internalName: 'c3po#die-jedi-dogs',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'An opponent takes control of this unit',
            immediateEffect: abilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                newController: context.player.opponent
            })),
        });

        registrar.addActionAbility({
            title: 'Deal damage equal to this unit\'s power to another ground unit',
            cost: [abilityHelper.costs.exhaustSelf()],
            canBeTriggeredBy: RelativePlayer.Opponent,
            targetResolver: {
                activePromptTitle: (context) => `Deal ${context.source.getPower()} damage to another ground unit`,
                zoneFilter: ZoneName.GroundArena,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                    amount: context.source.getPower(),
                }))
            }
        });
    }
}