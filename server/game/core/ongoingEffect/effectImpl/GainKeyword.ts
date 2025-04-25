import type { IKeywordProperties, KeywordNameOrProperties } from '../../../Interfaces';
import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';
import * as Helpers from '../../utils/Helpers';
import * as KeywordHelpers from '../../ability/KeywordHelpers';
import type { Card } from '../../card/Card';

export class GainKeyword extends OngoingEffectValueWrapper<IKeywordProperties | IKeywordProperties[]> {
    public constructor(keywordProps: KeywordNameOrProperties | KeywordNameOrProperties[]) {
        if (Array.isArray(keywordProps)) {
            super(keywordProps.map((keyword) => (typeof keyword === 'string' ? { keyword } : keyword)));
        } else if (typeof keywordProps === 'string') {
            super({ keyword: keywordProps });
        } else {
            super(keywordProps);
        }
    }

    public override apply(target: Card): void {
        super.apply(target);

        this.refreshKeywordAbilityEffects(target);
    }

    public override unapply(target: Card): void {
        super.unapply(target);

        this.refreshKeywordAbilityEffects(target);
    }

    private refreshKeywordAbilityEffects(target: Card): void {
        if (!target.isUnit()) {
            return;
        }

        const keywordInstances = Helpers.asArray(this.getValue()).map((keywordProps) => KeywordHelpers.keywordFromProperties(keywordProps, target));

        if (keywordInstances.some((keywordInstance) => keywordInstance.hasAbilityDefinition())) {
            target.refreshKeywordAbilityEffects();
        }
    }
}