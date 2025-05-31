import type { IKeywordProperties, KeywordNameOrProperties } from '../../../Interfaces';
import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';
import * as Helpers from '../../utils/Helpers';
import * as KeywordHelpers from '../../ability/KeywordHelpers';
import type { Card } from '../../card/Card';
import type Game from '../../Game';

export class GainKeyword extends OngoingEffectValueWrapper<IKeywordProperties | IKeywordProperties[]> {
    public constructor(game: Game, keywordProps: KeywordNameOrProperties | KeywordNameOrProperties[]) {
        if (Array.isArray(keywordProps)) {
            super(game, keywordProps.map((keyword) => (typeof keyword === 'string' ? { keyword } : keyword)));
        } else if (typeof keywordProps === 'string') {
            super(game, { keyword: keywordProps });
        } else {
            super(game, keywordProps);
        }
    }

    public override apply(target: Card): void {
        super.apply(target);

        this.refreshWhileInPlayKeywordAbilityEffects(target);
    }

    public override unapply(target: Card): void {
        super.unapply(target);

        this.refreshWhileInPlayKeywordAbilityEffects(target);
    }

    private refreshWhileInPlayKeywordAbilityEffects(target: Card): void {
        if (!target.isUnit() || !target.isInPlay()) {
            return;
        }

        const keywordProps = Helpers.asArray(this.getValue());

        if (keywordProps.some((props) => KeywordHelpers.hasWhileInPlayAbility[props.keyword])) {
            target.refreshWhileInPlayKeywordAbilityEffects();
        }
    }
}