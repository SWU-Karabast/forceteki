import type { IKeywordProperties, KeywordNameOrProperties } from '../../../Interfaces';
import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';
import * as Helpers from '../../utils/Helpers';
import * as KeywordHelpers from '../../ability/KeywordHelpers';
import type { Card } from '../../card/Card';
import type Game from '../../Game';
import type { FormatMessage } from '../../chat/GameChat';

export class GainKeyword extends OngoingEffectValueWrapper<IKeywordProperties | IKeywordProperties[]> {
    public constructor(game: Game, keywordProps: KeywordNameOrProperties | KeywordNameOrProperties[]) {
        const effectDescription: FormatMessage = {
            format: 'give {0}',
            args: Helpers.asArray(keywordProps).map((keyword) => {
                return KeywordHelpers.keywordDescription(keyword);
            })
        };

        if (Array.isArray(keywordProps)) {
            super(game, keywordProps.map((keyword) => (typeof keyword === 'string' ? { keyword } : keyword)), effectDescription);
        } else if (typeof keywordProps === 'string') {
            super(game, { keyword: keywordProps }, effectDescription);
        } else {
            super(game, keywordProps, effectDescription);
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