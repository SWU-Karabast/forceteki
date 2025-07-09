import AbilityHelper from '../../../AbilityHelper';
import { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { CardType, RelativePlayer } from '../../../core/Constants';

export default class RogerRoger extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '1555775184',
            internalName: 'roger-roger',
        };
    }

    protected override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.addWhenDefeatedAbility({
            title: 'Attach to a friendly Battle Droid token',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: CardType.TokenUnit,
                cardCondition: (card) => card.title === 'Battle Droid',
                immediateEffect: AbilityHelper.immediateEffects.attachUpgrade((context) => ({
                    upgrade: context.source
                }))
            }
        });
    }
}
