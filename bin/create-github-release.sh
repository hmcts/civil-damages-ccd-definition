#!/usr/bin/env bash

getNextReleaseVersion() {
  repoName=$1
  currentVersion=$(curl --silent "https://api.github.com/repos/hmcts/${repoName}/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
  IFS='.' read -a versionParts <<< "$currentVersion"
  patchVersion=$((versionParts[2] + 1))
  echo "${versionParts[0]}.${versionParts[1]}.${patchVersion}"
}

getToken() {
  az keyvault secret show --vault-name infra-vault-nonprod --name hmcts-github-apikey --query value -o tsv
}

createNewRelease() {
  repoName=$1
  token=$(getToken)
  nextReleaseVersion=$(getNextReleaseVersion $1)

  curl \
    -X POST \
    -H "Accept: application/vnd.github.v3+json" \
    -H "Authorization: token ${token}" \
    https://api.github.com/repos/hmcts/civil-damages-ccd-definition/releases \
    -d "{\"tag_name\":\"${nextReleaseVersion}\",\"name\":\"civil-damages-ccd-definition-v${nextReleaseVersion}\",\"body\":\"${$BUILD_URL}\"}" \
    | docker run --rm --interactive stedolan/jq '.id'
}

uploadReleaseAsset() {
  repoName=$1
  releaseId=$2
  assetName=$3
  token=$(getToken)

  curl \
    -X POST \
    -H "Authorization: token ${token}" \
    -H "Content-Type: application/zip" \
    -d @$assetName \
    https://uploads.github.com/repos/hmcts/${repoName}/releases/${releaseId}/assets?name=${assetName}
}

zip -r civil-damages-ccd-definition.zip ccd-definition
zip -r civil-damages-e2e.zip e2e codecept.conf.js package.json steps.d.ts yarn.lock
cp build/ccd-release-config/civil-damages-ccd-definition-aat.xlsx civil-damages-ccd-definition-aat.xlsx

releaseId=$(createNewRelease civil-damages-ccd-definition)

uploadReleaseAsset civil-damages-ccd-definition $releaseId civil-damages-ccd-definition.zip
uploadReleaseAsset civil-damages-ccd-definition $releaseId civil-damages-e2e.zip
uploadReleaseAsset civil-damages-ccd-definition $releaseId civil-damages-ccd-definition-aat.xlsx

rm civil-damages-ccd-definition.zip
rm civil-damages-e2e.zip
rm civil-damages-ccd-definition-aat.xlsx
