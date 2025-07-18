import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, WildcardCardType } from '../../../core/Constants';

export default class KyloRenIKnowYourStory extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4145147486',
            internalName: 'kylo-ren#i-know-your-story',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Use the Force to draw a card',
            when: {
                onCardPlayed: (event, context) =>
                    event.player === context.player &&
                    (event.cardTypeWhenInPlay === CardType.BasicUpgrade || event.playAsType === WildcardCardType.Upgrade) &&
                    event.attachTarget === context.source,
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Draw a card',
                immediateEffect: AbilityHelper.immediateEffects.draw()
            }
        });
    }
}
