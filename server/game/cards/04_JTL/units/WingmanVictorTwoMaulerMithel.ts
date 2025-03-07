import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, PlayType } from '../../../core/Constants';

export default class WingmanVictorTwoMaulerMithel extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4921363233',
            internalName: 'wingman-victor-two#mauler-mithel',
        };
    }

    public override setupCardAbilities () {
        this.addPilotingAbility({
            type: AbilityType.Triggered,
            title: 'Create a TIE Fighter',
            when: {
                onCardPlayed: (event, context) =>
                    event.card === context.source &&
                    event.playType === PlayType.Piloting
            },
            immediateEffect: AbilityHelper.immediateEffects.createTieFighter((context) => ({
                target: context.player
            }))
        });
    }
}