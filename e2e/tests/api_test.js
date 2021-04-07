const config = require('../config.js');

Feature('CCD API tests @api-tests');

Scenario('Create claim', async (api) => {
  await api.createClaimWithRepresentedRespondent(config.applicantSolicitorUser);
});

Scenario('Amend claim documents', async (api) => {
  await api.amendClaimDocuments();
});

Scenario('Notify claim', async (api) => {
  await api.notifyClaim();
});

Scenario('Notify claim details', async (api) => {
  await api.notifyClaimDetails();
});

Scenario('Amend party details', async (api) => {
  await api.amendPartyDetails(config.adminUser);
});

Scenario('Acknowledge claim', async (api) => {
  await api.acknowledgeClaim(config.applicantSolicitorUser);
});

Scenario('Inform agreed extension date', async (api) => {
  await api.informAgreedExtensionDate();
});

Scenario('Defendant response', async (api) => {
  await api.defendantResponse();
});

Scenario('Claimant response', async (api) => {
  await api.claimantResponse();
});

Scenario('Create claim where respondent is litigant in person', async (api) => {
  await api.createClaimWithRespondentLitigantInPerson(config.applicantSolicitorUser);
});

Scenario('Create claim where respondent solicitor is not registered in my hmcts', async (api) => {
  await api.createClaimWithRespondentSolicitorFirmNotInMyHmcts(config.applicantSolicitorUser);
});

Scenario('Create claim and move it to caseman', async (api) => {
  await api.createClaimWithRepresentedRespondent(config.applicantSolicitorUser);
  await api.moveCaseToCaseman(config.adminUser);
});

// This will be enabled when PAY-3817 issue of two minutes is fixed
Scenario.skip('Resubmit claim after payment failure on PBA account ', async (api) => {
  await api.createClaimWithFailingPBAAccount(config.applicantSolicitorUser);
  await api.resubmitClaim(config.applicantSolicitorUser);
});
