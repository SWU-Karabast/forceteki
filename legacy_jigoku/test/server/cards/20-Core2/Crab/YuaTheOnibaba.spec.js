describe('Yua, the Onibaba', function () {
    integration(function () {
        describe('No duels', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['yua-the-onibaba', 'borderlands-defender', 'kaiu-envoy'],
                        hand: ['steel-on-steel']
                    },
                    player2: {
                        inPlay: ['kakita-taneharu'],
                        hand: ['duel-to-the-death', 'two-hands']
                    }
                });

                this.yuaTheOnibaba = this.player1.findCardByName('yua-the-onibaba');
                this.borderlandsDefender = this.player1.findCardByName('borderlands-defender');
                this.kaiuEnvoy = this.player1.findCardByName('kaiu-envoy');
                this.steelOnSteel = this.player1.findCardByName('steel-on-steel');
                this.kakitaTaneharu = this.player2.findCardByName('kakita-taneharu');
                this.duelToTheDeath = this.player2.findCardByName('duel-to-the-death');
                this.twoHands = this.player2.findCardByName('two-hands');

                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.yuaTheOnibaba, this.borderlandsDefender, this.kaiuEnvoy],
                    defenders: [this.kakitaTaneharu]
                });
            });

            it('cannot initiate duels', function () {
                this.player2.pass();
                this.player1.clickCard(this.steelOnSteel);
                expect(this.player1).toHavePrompt('Choose a character');
                expect(this.player1).not.toBeAbleToSelect(this.yuaTheOnibaba);
                expect(this.player1).toBeAbleToSelect(this.borderlandsDefender);

                this.player1.clickCard(this.borderlandsDefender);
                expect(this.player1).toHavePrompt('Choose a character');
                expect(this.player1).toBeAbleToSelect(this.kakitaTaneharu);

                this.player1.clickCard(this.kakitaTaneharu);
                expect(this.getChatLogs(5)).toContain(
                    'player1 plays Steel on Steel to initiate a military duel : Borderlands Defender vs. Kakita Taneharu'
                );
            });

            it('cannot be challenged to duels', function () {
                this.player2.clickCard(this.duelToTheDeath);
                expect(this.player2).toHavePrompt('Choose a character');
                expect(this.player2).toBeAbleToSelect(this.kakitaTaneharu);

                this.player2.clickCard(this.kakitaTaneharu);
                expect(this.player2).toHavePrompt('Choose a character');
                expect(this.player2).not.toBeAbleToSelect(this.yuaTheOnibaba);
                expect(this.player2).toBeAbleToSelect(this.borderlandsDefender);

                this.player2.clickCard(this.borderlandsDefender);
                expect(this.player1).toHavePrompt('Do you wish to refuse the duel?');
                expect(this.getChatLogs(5)).toContain(
                    'player2 plays Duel to the Death to initiate a military duel : Kakita Taneharu vs. Borderlands Defender'
                );
            });

            it('cannot be added to duels', function () {
                this.player2.clickCard(this.duelToTheDeath);
                this.player2.clickCard(this.kakitaTaneharu);
                this.player2.clickCard(this.borderlandsDefender);
                this.player1.clickPrompt('No');
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.twoHands);
                this.player2.clickCard(this.twoHands);

                expect(this.player2).toBeAbleToSelect(this.kaiuEnvoy);
                expect(this.player2).not.toBeAbleToSelect(this.yuaTheOnibaba);

                this.player2.clickCard(this.kaiuEnvoy);
                expect(this.getChatLogs(5)).toContain(
                    'player2 plays Two Hands to extend the duel challenge to Kaiu Envoy'
                );
            });
        });

        describe('Conflict Action ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['yua-the-onibaba', 'unleashed-experiment', 'borderlands-defender']
                    },
                    player2: {
                        inPlay: ['lion-s-pride-brawler', 'akodo-toturi', 'ardent-omoidasu']
                    }
                });

                this.yuaTheOnibaba = this.player1.findCardByName('yua-the-onibaba');
                this.unleashedExperiment = this.player1.findCardByName('unleashed-experiment');
                this.borderlandsDefender = this.player1.findCardByName('borderlands-defender');
                this.lionsPrideBrawler = this.player2.findCardByName('lion-s-pride-brawler');
                this.akodoToturi = this.player2.findCardByName('akodo-toturi');
                this.ardentOmoidasu = this.player2.findCardByName('ardent-omoidasu');
            });

            it('Buffs own bushis and weakens all non-bushi', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.yuaTheOnibaba, this.unleashedExperiment, this.borderlandsDefender],
                    defenders: [this.lionsPrideBrawler, this.akodoToturi, this.ardentOmoidasu]
                });
                this.player2.pass();
                this.player1.clickCard(this.yuaTheOnibaba);

                expect(this.yuaTheOnibaba.getMilitarySkill()).toBe(6);
                expect(this.yuaTheOnibaba.getPoliticalSkill()).toBe(1);
                expect(this.unleashedExperiment.getMilitarySkill()).toBe(3);
                expect(this.unleashedExperiment.getPoliticalSkill()).toBe(2);
                expect(this.borderlandsDefender.getMilitarySkill()).toBe(4);
                expect(this.borderlandsDefender.getPoliticalSkill()).toBe(4);
                expect(this.lionsPrideBrawler.getMilitarySkill()).toBe(3);
                expect(this.lionsPrideBrawler.getPoliticalSkill()).toBe(2);
                expect(this.akodoToturi.getMilitarySkill()).toBe(6);
                expect(this.akodoToturi.getPoliticalSkill()).toBe(3);
                expect(this.ardentOmoidasu.getMilitarySkill()).toBe(1);
                expect(this.ardentOmoidasu.getPoliticalSkill()).toBe(2);

                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Yua, the Onibaba to give all friendly participating bushi characters +1military / +1political and give all participating non-bushi characters -1military / -1political'
                );
            });
        });
    });
});