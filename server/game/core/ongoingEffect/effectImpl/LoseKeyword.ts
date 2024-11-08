import { KeywordName } from '../../Constants';
import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';
import type { InPlayCard } from '../../card/baseClasses/InPlayCard';
import { KeywordInstance } from '../../ability/KeywordInstance';

export class LoseKeyword extends OngoingEffectValueWrapper<KeywordName> {
    private blankedKeywordInstances: KeywordInstance[] = [];

    public override apply(target: InPlayCard) {
        const keywordInstancesToApplyTo = target.keywords.filter((keywordInstance) => keywordInstance.name === this.value);
        for (const instance of keywordInstancesToApplyTo) {
            instance.registerBlankingEffect(this);
            this.blankedKeywordInstances.push(instance);
        }
    }

    public override unapply(target: InPlayCard): void {
        for (const instance of this.blankedKeywordInstances) {
            instance.unregisterBlankingEffect(this);
        }
    }
}