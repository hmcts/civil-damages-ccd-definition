const config = require('../config.js');
const {waitForFinishedBusinessProcess, updateCaseData, assignCaseToDefendant} = require('../api/testingSupport');
const {dateTime} = require('../api/dataHelper');

const caseId = () => `${caseNumber.split('-').join('').replace(/#/, '')}`;
let caseNumber;

Feature('RPA handoff points tests @rpa-handoff-tests');

Scenario('Take claim offline', async (I) => {
  await createCaseUpUntilNotifyClaimDetails(I);

  await I.navigateToCaseDetailsAs(config.defendantSolicitorUser, caseNumber);
  await I.acknowledgeClaim('fullDefence');
  await I.informAgreedExtensionDate();

  await I.navigateToCaseDetailsAs(config.adminUser, caseNumber);
  await I.caseProceedsInCaseman();
  await I.assertNoEventsAvailable();
  await I.signOut();
});

Scenario('Defendant - Litigant In Person', async (I) => {
  await I.login(config.applicantSolicitorUser);
  await I.createCase(true);
  caseNumber = await I.grabCaseNumber();

  await waitForFinishedBusinessProcess(caseId());
  await I.navigateToCaseDetails(caseNumber);
  await I.assertNoEventsAvailable();
  await I.signOut();
});

Scenario('Defendant - Defend part of Claim', async (I) => {
  await createCaseUpUntilNotifyClaimDetails(I);
  await defendantAcknowledgeAndRespondToClaim(I, 'partDefence', 'partAdmission');
  await I.assertNoEventsAvailable();
  await I.signOut();
});

Scenario('Defendant - Defends, Claimant decides not to proceed', async (I) => {
  await createCaseUpUntilNotifyClaimDetails(I);
  await defendantAcknowledgeAndRespondToClaim(I, 'fullDefence', 'fullDefence');

  await I.navigateToCaseDetailsAs(config.applicantSolicitorUser, caseNumber);
  await I.respondToDefenceDropClaim();
  await I.assertNoEventsAvailable();
  await I.signOut();
});

Scenario('Defendant - Defends, Claimant decides to proceed', async (I) => {
  await createCaseUpUntilNotifyClaimDetails(I);
  await defendantAcknowledgeAndRespondToClaim(I, 'fullDefence', 'fullDefence');

  await I.navigateToCaseDetailsAs(config.applicantSolicitorUser, caseNumber);
  await I.respondToDefence();
  await I.assertNoEventsAvailable();
  await I.signOut();
});

Scenario('Claimant does not respond to defence with defined timescale', async (I) => {
  await createCaseUpUntilNotifyClaimDetails(I);

  await waitForFinishedBusinessProcess(caseId());
  await updateCaseData(caseId(), {claimDismissedDeadline: dateTime(-1)});

  console.log('Start waiting for Case dismissed scheduler ' + dateTime());
  // Sleep waiting for Case dismissed scheduler
  await sleep(600);
  console.log('Waiting finished ' + dateTime());

  await I.navigateToCaseDetailsAs(config.applicantSolicitorUser, caseNumber);
  await I.assertNoEventsAvailable();
});

function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

const createCaseUpUntilNotifyClaimDetails = async (I) => {
  await I.login(config.applicantSolicitorUser);
  await I.createCase();
  caseNumber = await I.grabCaseNumber();
  await I.notifyClaim();
  await assignCaseToDefendant(caseId());
  await I.notifyClaimDetails();
};

const defendantAcknowledgeAndRespondToClaim = async (I, acknowledgeClaimResponse, respondToClaimResponse) => {
  await I.navigateToCaseDetailsAs(config.defendantSolicitorUser, caseNumber);
  await I.acknowledgeClaim(acknowledgeClaimResponse);
  await I.informAgreedExtensionDate();
  await I.respondToClaim(respondToClaimResponse);
};
