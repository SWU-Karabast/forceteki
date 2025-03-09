import AbilityHelper from '../../../AbilityHelper';
import type { Attack } from '../../../core/attack/Attack';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, PlayType } from '../../../core/Constants';

export default class HanSoloHasHisMoments extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6720065735',
            internalName: 'han-solo#has-his-moments',
        };
    }

    public override setupCardAbilities () {
        this.addPilotingAbility({
            title: 'Attack with attached unit. If it\'s the Millennium Falcon, it deals its combat damage before the defender.',
            type: AbilityType.Triggered,
            when: {
                onCardPlayed: (event, context) => event.card === context.source && event.playType === PlayType.Piloting
            },
            initiateAttack: {
                attackerCondition: (card, context) => context.source.isUpgrade() && card === context.source.parentCard,
                attackerLastingEffects: [{
                    effect: AbilityHelper.ongoingEffects.dealsDamageBeforeDefender(),
                    condition: (attack: Attack) => attack.attacker.title === 'Millennium Falcon'
                }]
            },
        });
    }
}