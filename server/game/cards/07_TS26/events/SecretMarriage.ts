import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { TargetMode, Trait, WildcardCardType } from '../../../core/Constants';

export default class SecretMarriage extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'secret-marriage-id',
            internalName: 'secret-marriage',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.setEventAbility({
            title: 'Give a Shield token to each of up to 2 non-Vehicle units. If you give a Shield to an enemy unit this way, draw a card',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 2,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => !card.hasSomeTrait(Trait.Vehicle),
                immediateEffect: abilityHelper.immediateEffects.giveShield()
            },
            ifYouDo: (thenContext) => ({
                title: 'Draw a card',
                ifYouDoCondition: (context) => thenContext.target.some((x) => x.controller !== context.player),
                immediateEffect: abilityHelper.immediateEffects.draw()
            })
        });
    }
}