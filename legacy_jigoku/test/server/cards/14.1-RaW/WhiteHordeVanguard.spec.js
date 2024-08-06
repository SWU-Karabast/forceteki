describe('White Horde Vanguard', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 10,
                    inPlay: ['white-horde-vanguard', 'moto-youth', 'moto-chagatai'],
                    hand: ['in-service-to-my-lord', 'fine-katana', 'ornate-fan'],
                    dynastyDiscard: ['favorable-ground']

                },
                player2: {
                    honor: 10,
                    inPlay: ['doji-whisperer', 'kitsu-motso', 'matsu-tsuko'],
                    hand: ['try-again-tomorrow', 'mirumoto-s-fury', 'way-of-the-crane']
                }
            });

            this.whiteHordeVanguard = this.player1.findCardByName('white-horde-vanguard');
            this.motoYouth = this.player1.findCardByName('moto-youth');
            this.chagatai = this.player1.findCardByName('moto-chagatai');
            this.favorable = this.player1.placeCardInProvince('favorable-ground', 'province 1');
            this.service = this.player1.findCardByName('in-service-to-my-lord');

            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.motso = this.player2.findCardByName('kitsu-motso');
            this.tsuko = this.player2.findCardByName('matsu-tsuko');
            this.tryAgainTomorrow = this.player2.findCardByName('try-again-tomorrow');
            this.wayOCrane = this.player2.findCardByName('way-of-the-crane');
            this.fury = this.player2.findCardByName('mirumoto-s-fury');

            this.player1.pass();
            this.player2.clickCard(this.wayOCrane);
            this.player2.clickCard(this.whisperer);
            this.noMoreActions();
        });

        it('can not be bowed by opponents card effects during the first conflict.', function() {
            this.initiateConflict({
                type: 'military',
                attackers: [this.whiteHordeVanguard, this.motoYouth],
                defenders: []
            });

            this.player2.clickCard(this.fury);

            expect(this.player2).toBeAbleToSelect(this.motoYouth);
            expect(this.player2).not.toBeAbleToSelect(this.whiteHordeVanguard);
        });

        it('can not be moved in by opponents card effects during the first conflict.', function() {
            this.initiateConflict({
                type: 'military',
                attackers: [this.motoYouth],
                defenders: [this.motso]
            });

            this.player2.clickCard(this.motso);

            expect(this.player2).toBeAbleToSelect(this.chagatai);
            expect(this.player2).not.toBeAbleToSelect(this.whiteHordeVanguard);
        });

        it('can not be moved out by opponents card effects during the first conflict.', function() {
            this.initiateConflict({
                type: 'military',
                attackers: [this.motoYouth, this.whiteHordeVanguard],
                defenders: [this.whisperer]
            });

            this.player2.clickCard(this.tryAgainTomorrow);

            expect(this.player2).toBeAbleToSelect(this.motoYouth);
            expect(this.player2).not.toBeAbleToSelect(this.whiteHordeVanguard);
        });

        it('can be bowed by opponents card effects during later conflicts.', function() {
            this.initiateConflict({
                type: 'military',
                attackers: [this.motoYouth],
                defenders: [this.tsuko]
            });

            this.noMoreActions();
            this.noMoreActions();
            expect(this.player2).toHavePrompt('Initiate Conflict');
            this.player2.passConflict();
            this.noMoreActions();

            this.initiateConflict({
                type: 'political',
                attackers: [this.whiteHordeVanguard, this.chagatai],
                defenders: [],
                ring: 'fire'
            });
            this.player2.clickCard(this.fury);

            expect(this.player2).toBeAbleToSelect(this.chagatai);
            expect(this.player2).toBeAbleToSelect(this.whiteHordeVanguard);
        });

        it('can be moved in by opponents card effects during later conflicts.', function() {
            this.initiateConflict({
                type: 'military',
                attackers: [this.motoYouth],
                defenders: [this.tsuko]
            });

            this.noMoreActions();
            this.noMoreActions();
            expect(this.player2).toHavePrompt('Initiate Conflict');
            this.player2.passConflict();
            this.noMoreActions();

            this.initiateConflict({
                type: 'political',
                attackers: [this.chagatai],
                defenders: [this.motso],
                ring: 'fire'
            });
            this.player2.clickCard(this.motso);

            expect(this.player2).toBeAbleToSelect(this.whiteHordeVanguard);
        });

        it('can be moved out by opponents card effects during later conflicts.', function() {
            this.initiateConflict({
                type: 'military',
                attackers: [this.motoYouth],
                defenders: [this.tsuko]
            });

            this.noMoreActions();
            this.noMoreActions();
            expect(this.player2).toHavePrompt('Initiate Conflict');
            this.player2.passConflict();
            this.noMoreActions();

            this.initiateConflict({
                type: 'political',
                attackers: [this.whiteHordeVanguard],
                defenders: [this.whisperer],
                ring: 'fire'
            });
            this.player2.clickCard(this.tryAgainTomorrow);

            expect(this.player2).toBeAbleToSelect(this.whiteHordeVanguard);
        });

        it('can be bowed by controller card effects.', function() {
            this.initiateConflict({
                type: 'military',
                attackers: [this.whiteHordeVanguard],
                defenders: [this.tsuko]
            });

            this.chagatai.bowed = true;

            this.player2.pass();
            this.player1.clickCard(this.service);
            this.player1.clickCard(this.chagatai);

            expect(this.player1).toBeAbleToSelect(this.whiteHordeVanguard);
            this.player1.clickCard(this.whiteHordeVanguard);
            expect(this.whiteHordeVanguard.bowed).toBe(true);
            expect(this.chagatai.bowed).toBe(false);
        });
    });
});
