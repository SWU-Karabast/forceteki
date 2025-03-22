import AbilityHelper from '../../../../../server/game/AbilityHelper';
import { NonLeaderUnitCard } from '../../../../../server/game/core/card/NonLeaderUnitCard';
import { AbilityRestriction, AbilityType, ZoneName } from '../../../../../server/game/core/Constants';
import { DefeatSourceType } from '../../../IDamageOrDefeatSource';

export default class ChewbaccaFaithfulFirstMate extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7208848194',
            internalName: 'chewbacca#faithful-first-mate',
        };
    }

    public override setupCardAbilities() {
        this.addReplacementEffectAbility({
            title: 'This unit can\'t be defeated or returned to hand by enemy card abilities',
            when: {
                onCardDefeated: (event, context) =>
                    event.card === context.source &&
                    event.defeatSource.type === DefeatSourceType.Ability &&
                    event.defeatSource.player !== context.player,
                onCardMoved: (event, context) =>
                    event.card === context.source &&
                    event.destination === ZoneName.Hand &&
                    event.context.player !== context.player
            }
        });

        this.addPilotingGainAbilityTargetingAttached({
            type: AbilityType.Constant,
            title: 'This unit can\'t be captured or damaged by enemy card abilities',
            ongoingEffect: [
                AbilityHelper.ongoingEffects.cardCannot({
                    cannot: AbilityRestriction.ReturnToHand,
                    restrictedActionCondition: (context) => context.player !== this.controller,
                }),
                AbilityHelper.ongoingEffects.cardCannot({
                    cannot: AbilityRestriction.BeDefeated,
                    restrictedActionCondition: (context) => context.player !== this.controller,
                })
            ]
        });
    }
}
