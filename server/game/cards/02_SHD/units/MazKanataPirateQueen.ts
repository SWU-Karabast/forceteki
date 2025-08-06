import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType } from '../../../core/Constants';

export default class MazKanataPirateQueen extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9850906885',
            internalName: 'maz-kanata#pirate-queen',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Give an experience token to Maz Kanata',
            when: {
                onCardPlayed: (event, context) =>
                    event.cardTypeWhenInPlay === CardType.BasicUnit &&
                    event.player === context.player &&
                    event.card !== context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.giveExperience()
        });
    }
}
