import { IActionAbilityPropsWithType, ITriggeredAbilityPropsWithType } from '../../../Interfaces';
import type { InPlayCard } from '../../card/baseClasses/InPlayCard';
import type { Card } from '../../card/Card';
import { AbilityType } from '../../Constants';
import * as Contract from '../../utils/Contract';
import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';

export class GainAbility extends OngoingEffectValueWrapper<IActionAbilityPropsWithType | ITriggeredAbilityPropsWithType> {
    public readonly abilityType: AbilityType;
    public readonly properties: IActionAbilityPropsWithType | ITriggeredAbilityPropsWithType;

    private abilityIdentifier: string;
    private abilityUuidByTargetCard = new Map<InPlayCard, string>();
    private gainAbilitySource: Card;
    private source: Card;

    public constructor(gainedAbilityProps: IActionAbilityPropsWithType | ITriggeredAbilityPropsWithType) {
        super(Object.assign(gainedAbilityProps, { printedAbility: false }));

        this.abilityType = gainedAbilityProps.type;
    }

    public override setContext(context) {
        Contract.assertNotNullLike(context.source);
        Contract.assertNotNullLike(context.ability?.uuid);

        super.setContext(context);

        this.abilityIdentifier = `gained_from_${context.ability.abilityIdentifier}`;
        this.source = this.context.source;
        this.gainAbilitySource = this.source;
    }

    public override apply(target: InPlayCard) {
        Contract.assertNotNullLike(this.gainAbilitySource, 'gainAbility.apply() called before gainAbility.setContext()');
        Contract.assertDoesNotHaveKey(this.abilityUuidByTargetCard, target, `Attempting to apply gain ability effect '${this.abilityIdentifier}' to card ${target.internalName} twice`);

        const properties = Object.assign(this.value, { gainAbilitySource: this.gainAbilitySource, abilityIdentifier: this.abilityIdentifier });

        switch (properties.type) {
            case AbilityType.Action:
                this.abilityUuidByTargetCard.set(target, target.addGainedActionAbility(properties));
                return;

            case AbilityType.Triggered:
                this.abilityUuidByTargetCard.set(target, target.addGainedTriggeredAbility(properties));
                return;

            default:
                Contract.fail(`Unknown ability type: ${this.abilityType}`);
        }
    }

    public override unapply(target: InPlayCard) {
        Contract.assertHasKey(this.abilityUuidByTargetCard, target, `Attempting to unapply gain ability effect "${this.abilityIdentifier}" from card ${target.internalName} but it is not applied`);

        switch (this.abilityType) {
            case AbilityType.Action:
                target.removeGainedActionAbility(this.abilityUuidByTargetCard.get(target));
                return;

            case AbilityType.Triggered:
                target.removeGainedTriggeredAbility(this.abilityUuidByTargetCard.get(target));
                this.abilityUuidByTargetCard.delete(target);

                return;

            default:
                Contract.fail(`Unknown ability type: ${this.abilityType}`);
        }
    }
}
