import { IAbilityPropsWithType } from '../../../Interfaces';
import type { InPlayCard } from '../../card/baseClasses/InPlayCard';
import type { Card } from '../../card/Card';
import { AbilityType } from '../../Constants';
import * as Contract from '../../utils/Contract';
import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';

export class GainAbility extends OngoingEffectValueWrapper<IAbilityPropsWithType> {
    public readonly abilityType: AbilityType;
    public readonly properties: IAbilityPropsWithType;

    private abilityIdentifier: string;
    private abilityUuidByTargetCard = new Map<InPlayCard, string>();
    private gainAbilitySource: Card;
    private source: Card;

    public constructor(gainedAbilityProps: IAbilityPropsWithType) {
        super(Object.assign(gainedAbilityProps, { printedAbility: false }));

        this.abilityType = gainedAbilityProps.type;
    }

    public override setContext(context) {
        Contract.assertNotNullLike(context.source);

        if (context.ability?.abilityIdentifier) {
            this.abilityIdentifier = `gained_from_${context.ability.abilityIdentifier}`;
        } else if (context.ability?.isLastingEffect) {
            this.abilityIdentifier = 'gained_from_lasting_effect';
        } else if (!this.abilityIdentifier) {
            Contract.fail('GainAbility.setContext() called without a valid context');
        }

        super.setContext(context);

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

            case AbilityType.Constant:
                this.abilityUuidByTargetCard.set(target, target.addGainedConstantAbility(properties));
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
                this.abilityUuidByTargetCard.delete(target);
                return;

            case AbilityType.Constant:
                target.removeGainedConstantAbility(this.abilityUuidByTargetCard.get(target));
                this.abilityUuidByTargetCard.delete(target);
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
