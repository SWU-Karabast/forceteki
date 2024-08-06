import { CardTypes, CharacterStatus, EffectNames } from './Constants';
import EffectSource from './EffectSource';
import AbilityDsl from './abilitydsl';
import type BaseCard from './basecard';
import type Game from './game';
import type Player from './player';

export class StatusToken extends EffectSource {
    persistentEffects: any[] = [];
    printedType = 'token';
    overrideStatus?: CharacterStatus;

    constructor(
        public game: Game,
        public card: BaseCard,
        private initialStatus: CharacterStatus,
        title: string
    ) {
        super(game, title);
        this.applyEffects();
    }

    static create(game: Game, card: BaseCard, tokenType: CharacterStatus): StatusToken {
        switch (tokenType) {
            case CharacterStatus.Tainted:
                return new StatusToken(game, card, CharacterStatus.Tainted, 'Tainted Token');
            case CharacterStatus.Honored:
                return new StatusToken(game, card, CharacterStatus.Honored, 'Honored Token');
            case CharacterStatus.Dishonored:
                return new StatusToken(game, card, CharacterStatus.Dishonored, 'Dishonored Token');
        }
    }

    get controller() {
        return this.card.controller;
    }

    get grantedStatus() {
        return this.overrideStatus ?? this.initialStatus;
    }

    get grantedStatusName(): string {
        switch (this.grantedStatus) {
            case CharacterStatus.Honored:
                return 'Honorable';
            case CharacterStatus.Dishonored:
                return 'Dishonorable';
            case CharacterStatus.Tainted:
                return 'Tainter';
        }
    }

    applyEffects(): void {
        switch (this.grantedStatus) {
            case CharacterStatus.Honored:
                return this.applyHonoredEffect();
            case CharacterStatus.Dishonored:
                return this.applyDishonoredEffect();
            case CharacterStatus.Tainted:
                return this.applyTaintedEffect();
        }
    }

    removeEffects() {
        for (const effect of this.persistentEffects) {
            this.removeEffectFromEngine(effect.ref);
            effect.ref = [];
        }
        this.persistentEffects = [];
    }

    setCard(card: BaseCard) {
        this.removeEffects();
        this.card = card;
        this.applyEffects();
    }

    applyDishonoredEffect() {
        if (!this.card || this.card.type !== CardTypes.Character) {
            return;
        }
        const effect = {
            match: this.card,
            effect: AbilityDsl.effects.modifyBothSkills((card: BaseCard) => -card.getGlory()),
            ref: []
        };
        this.persistentEffects.push(effect);
        effect.ref = this.addEffectToEngine(effect);
    }

    applyHonoredEffect() {
        if (!this.card || this.card.type !== CardTypes.Character) {
            return;
        }
        const effect = {
            match: this.card,
            effect: AbilityDsl.effects.modifyBothSkills((card) => card.getGlory()),
            ref: []
        };
        this.persistentEffects.push(effect);
        effect.ref = this.addEffectToEngine(effect);
    }

    applyTaintedEffect() {
        if (!this.card) {
            return;
        }
        const effects =
            this.card.type === CardTypes.Character
                ? this.#taintEffectsOnCharacters()
                : this.card.type === CardTypes.Province
                ? this.#taintEffectsOnProvinces()
                : [];

        effects.forEach((effect: any) => {
            this.persistentEffects.push(effect);
            effect.ref = this.addEffectToEngine(effect);
        });
    }

    #taintEffectsOnCharacters() {
        return [
            {
                match: this.card,
                effect: AbilityDsl.effects.modifyBothSkills(2),
                ref: undefined
            },
            {
                match: this.card,
                condition: () => !this.card.anyEffect(EffectNames.TaintedStatusDoesNotCostHonor),
                effect: AbilityDsl.effects.honorCostToDeclare(1),
                ref: undefined
            }
        ];
    }

    #taintEffectsOnProvinces() {
        return [
            {
                match: this.card,
                condition: () =>
                    !(
                        this.card.game.currentConflict &&
                        this.card.game.currentConflict.anyEffect(EffectNames.ConflictIgnoreStatusTokens) &&
                        this.card.isConflictProvince()
                    ),
                effect: AbilityDsl.effects.modifyProvinceStrength(2),
                ref: undefined
            },
            {
                match: this.card.controller,
                condition: () => this.card.isConflictProvince(),
                effect: AbilityDsl.effects.costToDeclareAnyParticipants({
                    type: 'defenders',
                    message: 'loses 1 honor',
                    cost: (player: Player) =>
                        AbilityDsl.actions.loseHonor({
                            target: player,
                            amount: 1
                        })
                }),
                ref: undefined
            }
        ];
    }
}
