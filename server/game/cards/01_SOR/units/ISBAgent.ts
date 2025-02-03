import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName, RelativePlayer, CardType, WildcardCardType } from '../../../core/Constants';

export default class ISBAgent extends NonLeaderUnitCard {
    protected override readonly overrideNotImplemented: boolean = true;

    protected override getImplementationId() {
        return {
            id: '5154172446',
            internalName: 'isb-agent'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Reveal an event from your hand',
            targetResolver: {
                cardTypeFilter: CardType.Event,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.reveal()
            },
            ifYouDo: {
                title: 'Deal 1 damage to a unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
                }
            }
        });
    }
}

ISBAgent.implemented = true;